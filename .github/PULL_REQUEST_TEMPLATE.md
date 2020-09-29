---
name: Pull Request Template
about: Basic formatting guide for pull requests. You may omit any irrelevant fields.
title: "[SHORT DESCRIPTION OF PULL REQUEST]"
labels: 
assignees: ''

---

**LINKED ISSUE**

_[Whenver possible, a pull request should address a pre-existing issue. 
That issue can be linked to the pull request by using the side panel in the Github UI or 
using the `#` symbol followed by the number of the associated issue]_

**DESCRIPTION**

_[A pull request description describes what constitutes the Pull Request and what changes you have made to the code.
It explains what you've done, including any code changes, configuration changes, migrations included, new APIs introduced, 
changes made to old APIs, any new workers/crons introduced in the system, copy changes, and so on. You get the gist.]_

You should include this section because it gives a glimpse to different stakeholders into what the PR is doing.
For a non-technical person, the description should explain what the impact will be on the system when these code changes are deployed to production.
It will also help the reviewer in understanding what they will be reviewing (kind of a prologue/trailer).
And finally it helps QA/SDET in understanding the scope of the PR as well.
So the "what" of the PR should give a glimpse into what constitutes the changes in the PR.

**METHODOLOGY**

_[This section explains why the above changes explained were done.
Sometimes a developer feels that it's okay to write "Business/Product requirement" in the description. That's fine, but doing so defeats the purpose of this section.
If there is a better explanation as to why the changes were suggested, it's always good to attach a document reference link for that information.
A good "Why" section should explain the reasoning behind any changes.]_

**TESTING SCOPE**

_[This section should comprise a list of scenarios you need to keep an eye on when testing this particular PR. 
(This will include flows, APIs, crons, workers, and so on.)
A good testing scope gives visibility to the QA/SDET team about the scenarios and flows that they need to test.
It can also help you while you're writing this section. I have come across issues myself, which prompted me to go back to the development phase and test them again.
Omit if not relevant.]_

**RELEVANT DOCUMENT(S)**

_[This section includes any relevant document that needs to be attached with the PR description.
That might include product requirement documents, architectural diagrams, database system diagrams, design patterns used, class diagrams, 
external library documentation, and so on.
This section helps explain any assumptions and references you made while working on this feature request. And it plays a major role in the long run.
When someone comes back and sees why such a change was suggested, 
the relevant documents section will take them to the specific documentation so they can understand the issue clearly. 
Or it can take them to the technical implementation details of the scenario at the time of development.]_

**DEPENDENT PRs**

_[There are times when a particular feature spans across multiple GitHub repositories and it's important to release them in a certain order.
For example, you might need to deploy one repo prior to another, or you might need to deploy them side by side.
Whatever the case may be, this section explains any dependent code that this PR relies upon.
You should include this section because it really helps the deployer understand the order of deployment.
If another repo's code needs to go first, then the deployer will contact the person responsible for deployment of the other repo to make sure that their 
deployment happens first. Overall it helps smooth out the deployment process.]_

**CONFIGURATION CHANGES**

_[This section should include all the config changes that need to be added to the secrets before the PR is deployed into production.
There will be times when the deployer will merge 10-20 PRs at a time and it becomes hard for them to keep track of all the config changes.
Because of this, it's always better to include them in the config changes section. 
(Don't put the secret keys there, just include the key names and how to get the secrets.)]_

**TAGS/LABELS**

_[These are very important in a pull request description and convey a lot of meaning when the team grows.]_

---

This PR was modeled after the information given in [this](https://www.freecodecamp.org/news/how-to-write-a-pull-request-description/) article by Sajal Sharma.
