#!usr/bin/env node
// this file uses typescript; brief tutorial in comments.

/**
 * Return of this file should always be in JSON format.
*/

/** 
 * exhaustive example of a channel object:
 {
   id: 1,
   name: "admin_channel",
   icon: "/app/media/icons/epic_chalice_of_jewels_and_blood_and_dreams.svg",
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

// For those unfamiliar with typescript: it's just javascript! Deep breaths.
// Most basic tutorial ever =>

// type x = string; 
//  const example: x = "1"; 
//    example is now a var that's locked to the string type. It can be "1" but not 1.
// type y = 5 | "five" | true; 
//  const example: y = "five"; 
//    example is locked to being exactly 5, "five", or true. It cannot be 4, "four", or "true".
// type z = any;
//  const example: z = { september: "do you remember?", night: 21 }; 
//    example acts as javascript normally does, allowing any data type as its referenced value

// interface Stuff {
//    id: number
//    name?: string
//    smell: string[]
// }

// interface assigns types to keys of an object.
// const example: Stuff;
//  example must be an object and must have the fields [id] and [smell].
//  example[id] must be a property of the object and have the typeof(1) or typeof(0.01)
//  example[name] ends with a "?", which means it is a an optional property of the object, but if it exists then it must be a string
//  example[smell] will be an array, and the entries in that array will all be locked to string type. ["sweet", "4", "stanky"] is valid, but ["sweet", 4, "stanky"] is not. This same concept can be denoted with Array<string>, with some nuanced differences that are well explained in the official docs.

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
 * Note: {[id]: 0} is always admin channel. I don't know if this is even a thing, but it should be kept as a placeholder nonetheless
*/
const generateNextChannelId = (
  () => {
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
    id: 0, 
    name: "admin", 
    description: "The inner-est of the inner circles. Like, if there are 9 rings of hell, this is the 10th ring where all the paperwork gets done. And somehow people volutarily sign up for this. <3 <3 <3"
  },
  {
    id: generateNextChannelId(),
    name: "welcome",
    description: "Virtual Coffee's front door! (Well maybe we have lots of confetti and streamers instead of a door)"
  },
  {
    id: generateNextChannelId(),
    name: "general",
    description: "Community questions, event recaps and TPS reports from #mngmnt."
  },
  {
    id: generateNextChannelId(),
    name: "random",
    description: "Diverse dialogue! Bottomless banter! Excessive exclamations! Also a landfill for Kirk's lesser memes.",
    reminders: [
      {
        message: "All are encouraged to be familiar with our code of conduct before posting in any channel.",
        url: "https://virtualcoffee.io/code-of-conduct/"
      }
    ]
  },
  {
    id: generateNextChannelId(),
    name: "announcements",
    description: "This channel keeps you in the loop! Virtual Coffee endorsed events, links and dates are posted here."
  },
  {
    id: generateNextChannelId(),
    name: "articles-and-resources",
    description: "Got curiosity? Well good, because here in coder-land it's basically your health bar. Here are some things to help expand your code brain!"
  },
  {
    id: generateNextChannelId(),
    name: "brownbags",
    description: "The term 'brownbag' refers to an informal meeting, often held over a lunch break (lunches brought in brown bags) and provides a ~30 minute overview of a particular technology. At the very least, these are exceptional opportunities to expand a developer's vocabulary and keep an ear to the ever-shifting ground of technology. Have a topic or tech you want to talk about? We want to hear your brownbag on it!!!"
  },
  {
    id: generateNextChannelId(),
    name: "politics",
    description: "Discussions, comments and updates relevant to political ongoings.",
    reminders: [
      {
        message: "Virtual Coffee acknowledges that governance is an unavoidable and very engaging topic which has an immediate impact on the daily lives of our members, and is therefore an important topic of discussion. However, it is imperative that those who participate in this discussion remember that without careful consideration of context, audience and perspective this can easily become a hostile environment for those with under represented perspectives. Virtual Coffee's goal is to promote positive interaction between those who have an interest in technology, of which the exchange of ideas is a crucial aspect. Please be sure to keep the Code of Conduct in consideration while participating in this channel.",
        url: "https://virtualcoffee.io/code-of-conduct/",
        formatting: ["i"],
        priority: 1
      }
    ]
  }
];

const main = {channels};

module.exports = JSON.stringify(main);
