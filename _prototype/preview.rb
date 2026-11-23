# Throwaway PS1 blog prototype. Run with ruby _prototype/preview.rb.
require 'webrick'
require 'erb'
require 'yaml'
require 'date'
require 'kramdown'
require 'kramdown-parser-gfm'
require 'rss'

root = File.expand_path('..', __dir__)
posts = Dir["#{root}/_posts/*"].map do |file|
  _, header, body = File.read(file).split(/^---\s*$\n?/, 3)
  meta = YAML.safe_load(header, permitted_classes: [Date, Time])
  date = Date.parse(meta['date'].to_s)
  category = meta.fetch('categories').split.first
  slug = File.basename(file, '.*').sub(/^\d{4}-\d\d-\d\d-/, '')
  {title: meta.fetch('title'), date: date, category: category, body: body,
   url: "/#{category}/#{date.strftime('%Y/%m/%d')}/#{slug}.html"}
end.sort_by { |post| post[:date] }.reverse
server = WEBrick::HTTPServer.new(Port: ENV.fetch('PORT', 4173).to_i, BindAddress: '127.0.0.1')
server.mount('/images', WEBrick::HTTPServlet::FileHandler, "#{root}/images")
%w[style.css scene.js].each { |name| server.mount("/#{name}", WEBrick::HTTPServlet::FileHandler, "#{__dir__}/#{name}") }
server.mount_proc('/') do |req, res|
  variant = %w[A B C].include?(req.query['variant']) ? req.query['variant'] : 'A'
  article = posts.find { |post| post[:url] == req.path }
  if req.path == '/feed.xml'
    res['Content-Type'] = 'application/rss+xml'
    res.body = RSS::Maker.make('2.0') do |rss|
      rss.channel.title = "Asok's blog"
      rss.channel.description = 'Programming notes'
      rss.channel.link = 'https://asok.github.io/'
      posts.each do |post|
        item = rss.items.new_item
        item.title = post[:title]
        item.link = "https://asok.github.io#{post[:url]}"
      end
    end.to_s
  elsif req.path == '/' || article
    res['Content-Type'] = 'text/html; charset=utf-8'
    res.body = ERB.new(File.read("#{__dir__}/page.erb")).result(binding)
  else
    res.status = 404
    res.body = 'Page not found'
  end
end
trap('INT') { server.shutdown }
server.start
