Single-page applications become more and more complicated, and front-end development faces new challenges every day. Nowadays it is almost a standard, that state of the application should be separated, and ideally it should be a single source of truth, absolutely independent from UI – we learned hard lessons from times of Backbone models, which were updating each other through intrinsic set of events, and finally created such a tangled mess of events, that maintaining and extending it was almost impossible.

Thanks to the efforts of community, right now we have a lot of alternatives, which try to address all previous issues in different manner. One of the most popular frameworks, React.js, popularized unidirectional data flow paradigm, which after several attempts to implement naturally produced the most popular one – Redux. Redux itself is a pretty simple concept, which argues about putting data in a single state, and modifying it only through specific actions, which return certain action types, and then processed by so-called "reducers" – they put data inside our state. Also, there were several additional concepts – middlewares to process returned actions, encouraging creation of instance, rather than singletone \(which allowed to perform server-side rendering\), and it literally revolutionized the front-end world. Redux was first introduced on React-Europe 2015, and it conquered the world 
