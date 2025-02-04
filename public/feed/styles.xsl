<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>
          <xsl:value-of select="/rss/channel/title"/> RSS Feed
        </title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            font-size: 14px;
            color: #666666;
            line-height: 20px
            padding: 15px;
          }
          a, a:link, a:visited {
            color: #92C13C;
            color: #0000EE;
            text-decoration: none;
            text-decoration: underline;
          }
          a:hover {
            color: #578600;
            color: #0000EE;
            text-decoration: none;
          }
          .alert {
            color: #999999;
            font-size: 11px;
            margin-bottom: 20px;
            text-align: center;
          }
          .container {
            max-width: 850px;
            margin: 0 auto;
            background: #fff;
            border-radius: 4px;
            padding: 15px;
          }
          .podcast-container {
            background: #FAFAFA;
            border: 1px solid #EAEAEA;
            border-radius: 5px;
            display: flex;
            padding: 15px;
          }
          .podcast-image {
            margin-right: 30px;
            width: 150px;
          }
          .podcast-image img {
            width: 150px;
            height: auto;
            border-radius: 5px;
          }
          .podcast-title {
            color: #222222;
            font-size: 25px;
            line-height: 30px;
            margin: 10px 0 0 0;
          }
          .podcast-description {
            line-height: 19px;
            margin-top: 10px;
          }
          .item {
            clear: both;
            border-bottom: 1px solid #EAEAEA;
            padding: 30px 0;
          }
          .episode-title {
            color: #222222;
            font-size: 20px;
            line-height: 25px;
            margin: 0 0 5px 0;
          }
          .episode-meta {
            font-size: 11px;
            color: #999999;
            margin-bottom: 15px;
            text-transform: uppercase;
          }
          .episode-description {
            line-height: 19px;
            margin-bottom: 30px;
          }
          .episode-image img {
            width: 100px;
            height: auto;
            margin: 0 30px 15px 0;
            border-radius: 5px;
          }
          audio {
            width: 100%;
            border-radius: 5px;
          }
          audio:focus {
            outline: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert">
            To subscribe to this podcast, copy and paste the URL from the address bar into the podcast app of your choice.
          </div>
          <div class="podcast-container">
            <xsl:if test="/rss/channel/image">
              <div class="podcast-image">
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="/rss/channel/image/link"/>
                  </xsl:attribute>
                  <img>
                    <xsl:attribute name="src">
                      <xsl:value-of select="/rss/channel/image/url"/>
                    </xsl:attribute>
                    <xsl:attribute name="title">
                      <xsl:value-of select="/rss/channel/image/title"/>
                    </xsl:attribute>
                  </img>
                </a>
              </div>
            </xsl:if>
            <div>
              <h1 class="podcast-title">
                <xsl:value-of select="/rss/channel/title"/>
              </h1>
              <div class="podcast-description">
                <xsl:value-of select="/rss/channel/description" disable-output-escaping="yes"/>
              </div>
            </div>
          </div>
          <xsl:for-each select="/rss/channel/item">
            <div class="item">
              <h2 class="episode-title">
                <xsl:value-of select="title"/>
              </h2>
              <div class="episode-meta">
                <span>
                  <xsl:value-of select="pubDate" />
                </span> &#9702;
                <span>
                  <xsl:value-of select="format-number(floor(itunes:duration div 60), '0')" /> minutes
                </span>
              </div>
              <xsl:if test="description">
                <div class="episode-description">
                  <xsl:value-of select="description" disable-output-escaping="yes"/>
                </div>
              </xsl:if>
              <audio controls="true" preload="none">
                <xsl:attribute name="src">
                  <xsl:value-of select="enclosure/@url"/>
                </xsl:attribute>
              </audio>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>