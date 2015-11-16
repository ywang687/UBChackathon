# UBChackathon
bcs hackathon

Goal: This is an app that aims to solve the problem of privacy. Unlike many chat apps out there today, UmbraChat solves the problem of persistence and anonymity. With UmbraChat, the user can say anything to anyone, without being identified or recorded.

Implementation: After entering the site, you are given a unique and random user ID. You can choose to create a chat room (also with a unique ID) or join an existing one. To talk to someone, just enter their user ID (you will need to obtain this from somewhere else, say facebook or skype) and the system will match you to their chatroom. Every time you send a message, your user ID changes to a new randomly generated one. Since this user ID could have been someone else's a second ago, it's impossible to identify someone using a user ID. Since multiple people could be in a chat room at the same time, you may be worried about someone listening in to your conversation. This is where the second layer of security comes in. You could share an encryption key with the person you want to talk to, and as long as you are both using the same encryption key, you can communicate normally, while everyone else will see gibberish. 

