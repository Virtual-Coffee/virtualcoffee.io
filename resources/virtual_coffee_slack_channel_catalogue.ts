#!usr/bin/env node

/**
 * Return of this file should always be in JSON format.
 * Exhaustive example of a channel object:
 {
   id: 0,
   name: "admin_channel",
   icon: "/app/media/icons/epic_chalice_of_jewels.svg",
   description: "How'd you get in here!?! Guards, sieze them!!",
   moderators: ["Bekah HG Wells", "Danatello Otterman", "Mikhail Rogersonbergerville", "Klirk Beastwood"],
   reminders: [
     {
       priority: 1, // 0 should be reserved for emergency notifications
       "formatting": ["i", "-"],
       "url": "https://virtualcoffee.io/code-of-conduct/",
       "message": "Link to code of conduct"
     }
   ]
 }
 * 
 * template barebones channel object:
{
  id: generateNextChannelId(),
  name: "",
  description: "",
}
*/

interface Channel {
  id: number
  name: string
  icon?: string
  description: string
  moderators?: string[]
  reminders?: ChannelReminders[]
}
interface ChannelReminders {
  message: string
  formatting?: Array<"i"|"b"|"u"|"s"|"+"|"-"> // italics|bold|underline|strikethrough|fontSize up|fontSize down
  url?: string
  priority?: number // lesser number is higher priority
}

/** generates endless unique id numbers.
 * Note: {[id]: 0} is always admin channel.
*/
const generateNextChannelId = (
  function() {
    let counter = 0;
    return () => {
      counter +=1;
      return counter;
    };
  }
)();

/** channels object official */
const channels: Channel[] = [
  {
    name: "admin", 
    id: 0, 
    description: ""
  },
  {
    name: "welcome",
    id: generateNextChannelId(),
    description: "Virtual Coffee's front door! (Well, maybe lots of confetti and streamers instead of a door)"
  },
  {
    name: "general",
    id: generateNextChannelId(),
    description: "Community questions, event recaps and TPS reports from #mngmnt."
  },
  {
    name: "random",
    id: generateNextChannelId(),
    description: "Diverse dialogue! Bottomless banter! Excessive exclamations!",
    reminders: [
      {
        message: "All are encouraged to be familiar with our code of conduct before posting in any channel.",
        url: "https://virtualcoffee.io/code-of-conduct/"
      }
    ]
  },
  {
    name: "announcements",
    id: generateNextChannelId(),
    description: "This channel keeps you in the loop! Virtual Coffee endorsed events, links and dates are posted here."
  },
  {
    name: "articles-and-resources",
    id: generateNextChannelId(),
    description: "Got curiosity? Here are some things to help expand your code brain!"
  },
  {
    name: "brownbags",
    id: generateNextChannelId(),
    description: "The term 'brownbag' refers to an informal meeting, often held over a lunch break (lunches brought in brown bags) and provides a ~30 minute overview of a particular topic. These are exceptional opportunities to expand developer vocabulary and keep aware of new tech. Have a topic you want to talk about? We want to hear your brownbag on it!"
  },
  {
    name: "politics",
    id: generateNextChannelId(),
    description: "Discussions, comments and updates relevant to political ongoings.",
    reminders: [
      {
        message: "Virtual Coffee acknowledges that politics is an important but often divisive topic. Our goal is to promote positive interaction between those who have an interest in technology. All participants in this channel are expected to excercise mindfulness regarding context, audience and perception, as well as be familiar with the Code of Conduct.",
        url: "https://virtualcoffee.io/code-of-conduct/",
        formatting: ["i"],
        priority: 1
      }
    ]
  },
];

const main = {channels};

module.exports = JSON.stringify(main);
