---
layout: layouts/resources.njk
title: Virtual Coffee Member Resources
description: A collection of guides for current and prospective Virtual Coffee members
hero: 'svg/undraw_product_teardown_elol.svg'
heroHeader: 'Virtual Coffee Member Resources'
heroSubheader: A collection of guides for current and prospective Virtual Coffee members
tags:
  - memberresources
  - memberresourcesIndex
eleventyNavigation:
  key: VcResources
  title: Virtual Coffee Member Resources
  excerpt: A collection of guides for current and prospective Virtual Coffee members
  parent: Resources
  order: 1
---

{% textContainer 'light'%}

## Virtual Coffee Member Resources

{{ collections.memberresources | eleventyNavigation: "VcResources" | displayNavigationList }}

{% endtextContainer %}
