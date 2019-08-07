module.exports = io => {
    io.sockets.on("connection", socket => {
        let id = socket.id;
        // console.log("client connected");

        // socket.emit("client-emit", id);

        socket.on("user-emit", data => {
            if (!clients.find(client => client.username === data.username))
                clients.push({ ...data, id });
            console.log(clients);
            io.emit("fetch-users", clients);
        });

        socket.on("new-chat", data => {
            let chat = chats.find(chat => chat.users.filter(user => data.map(d => user.username === d)))

            if (!chat) {
                let users = clients.filter(client => data.map(d => d === client.username))
                chat = { id: uuid(), users, messages: [] }
                chats.push(chat)
            }

            socket.join(chat.id)
            socket.emit("fetch-chat", chat);
            // socket.to(chat.id).emit('fetch-messages', chat.messages) 
        });

        socket.emit("fetch-chats", chats);

        socket.on("remove-chat", chatId => chats.filter(chat => chat.id !== chatId));

        socket.on("add-user-to-chat", (userId, chatId) => {
            let chat = chats.find(chat => chat.id === chatId);

            if (chat) {
                socket.join(chat.id);
                chat["users"].push(userId);
                socket.to(chat.id).emit("refresh-users-from-chat", chat.users);
            } else {
                socket.emit("error-in-chat", "An error occured");
            }
        });

        socket.on("remove-user-from-chat", (username, chatId) => {
            let chat = chats.find(chat => chat.id === chatId);

            if (chat) {
                chat["users"].filter(user => user.username !== username);
                socket.emit("refresh-users-from-chat", chat.users);
            } else {
                socket.emit("error-in-chat", "An error occured");
            }
        });

        socket.on("new-message", message => {
            let chat = chats.find(chat => chat.id === message.chatId);

            if (chat) {
                chat["messages"] = [
                    ...chat.messages,
                    {
                        ...message,
                        date: new Date()
                    }
                ];

                io.to(chat.id).emit("fetch-chat", chat);
            } else {
                console.log("error");
                socket.emit("error-in-chat", "An error occured");
            }
        });

        socket.on("typing", () => {
            socket.broadcast.emit("is-typing", true);
        });

        socket.on("stop-typing", () => {
            socket.broadcast.emit("is-typing", false);
        });

        socket.on("disconnect", () => {
            clients.filter(client => {
                if (client.id === id) {
                    socket.broadcast.emit("user-disconnected", client.username);
                    return null;
                } else return client;
            });
            console.log(clients);
        });
    });
}