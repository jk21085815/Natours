const mongoose = require('mongoose');
const dotenv =require('dotenv');

dotenv.config({path: './confing.env'});


mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log("Connection successfull");
    // console.log(con.connections)
})



const app = require('./app');


// console.log(process.env);

const port = process.env.PORT ;
app.listen(port, ()=>{
    console.log(`app is running on ${port}`)
});


process.on('unhandledRejection', err => {
    console.log("unhandle rejection");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});


process.on('uncaughtException', err => {
    console.log("uncaught rejection");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
})


