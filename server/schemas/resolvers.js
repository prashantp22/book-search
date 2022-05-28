const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                //.populate('savedBooks');
      
              return userData;
            }
      
            throw new AuthenticationError('Not logged in');
        } 
    },

    Mutation: {
        //login mutation, using email and password
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
            return { token, user };
          },

        //create new user with username, email, password
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { user, token };
            // const user = await User.create(body);

            // if (!user) {
            //   return res.status(400).json({ message: 'Something is wrong!' });
            // }
            // const token = signToken(user);
            // res.json({ token, user });
        },

        //add book to user's collection
        saveBook: async (parent, args, context) => {
            if(context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.bookData } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("You are not logged in");
          },
        
        //remove book from user's collection
        removeBook: async (parent, args, context) => {
            if (context.user) {
              console.log();
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: {bookId: args.bookId } } },
                    { new: true, runValidators: true }
                  );
                  console.log(updatedUser);
                  return updatedUser;
            }
            throw new AuthenticationError("User is not logged in");
        }
    }
};

module.exports = resolvers;