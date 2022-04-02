---
layout: layouts/resources.njk
title: Developer Resources
description: A collection of guides for developers
hero: 'svg/undraw_developer_activity_re_39tg.svg'
heroHeader: 'Developer Resources'
heroSubheader: A collection of guides for developers
tags:
  - memberresources
  - memberresourcesIndex
eleventyNavigation:
  key: DevResources
  title: Developer Resources
  excerpt: A collection of guides for developers
  parent: Resources
  order: 3
---

{% textContainer 'light'%}

## Developer Resources

{{ collections.memberresources | eleventyNavigation: "DevResources" | displayNavigationList }}

{% endtextContainer %}
