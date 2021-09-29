---
layout: layouts/resources.njk
title: Open Source Resources
description: A collection of guides by our members interested in Open Source Software
hero: 'svg/undraw_version_control_9bpv.svg'
heroHeader: Open Source Resources
heroSubheader: A collection of guides by our members interested in Open Source Software
tags:
  - memberresources
  - memberresourcesIndex
eleventyNavigation:
  key: OSS
  title: Open Source Resources
  excerpt: A collection of guides by our members interested in Open Source Software
  parent: Resources
  order: 2
---

{% textContainer 'light'%}

## Open Source Resources {.display-4 .mb-5}

{{ collections.memberresources | eleventyNavigation: "OSS" | displayNavigationList }}

{% endtextContainer %}
