const express = require('express');
var cors = require('cors');
const app = express();
const port = 3000;

// These lines will be explained in detail later in the unit
app.use(express.json());// process json
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// These lines will be explained in detail later in the unit

const MongoClient = require('mongodb').MongoClient;
//const uri = "mongodb+srv://giftadmin:admin@cluster0.pvzye.mongodb.net/?retryWrites=true&w=majority";
const uri = "mongodb+srv://giftadmin:admin@cluster0.5fdfa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	ssl: true
  };
const client = new MongoClient(uri,options);
// Global for general use
var userCollection;
var orderCollection;

client.connect(err => {
	userCollection = client.db("giftdelivery").collection("users");
	orderCollection = client.db("giftdelivery").collection("orders");

	// perform actions on the collection object
	console.log('Database up!\n')

});


app.get('/', (req, res) => {
	res.send('<h3>Welcome to Gift Delivery server app!</h3>')
})


app.get('/getUserDataTest', (req, res) => {

	console.log("GET request received\n for testing user data");

	userCollection.find({}, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log(JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>");
		}

	});

});

app.post('/checkEmail', (req, res) => {
	console.log("POST request received for checking if email exists: " + JSON.stringify(req.body) + "\n");
	userCollection.findOne({ email: req.body.email }, (err, user) => {
		if (err) {
			console.error("Error checking email: ", err);
			res.status(500).send("Error checking email");
		} else {
			res.status(200).json({ exists: !!user });
		}
	});
});


app.get('/getOrderDataTest', (req, res) => {
	console.log("GET request received for testing order data\n");
	orderCollection.find({}, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log(JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send("<h1>" + JSON.stringify(docs) + "</h1>");
		}
	});
});



app.post('/verifyUser', (req, res) => {
	console.log("POST request received for logging in: " + JSON.stringify(req.body) + "\n");
	loginData = req.body;
	userCollection.find({ email: loginData.email, password: loginData.password }, { projection: { _id: 0 } }).toArray(function (err, docs) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log(JSON.stringify(docs) + " have been retrieved.\n");
			res.status(200).send(docs);
		}

	});

});

app.post('/signup', (req, res) => {
	console.log("POST request received for sign up data : " + JSON.stringify(req.body) + "\n");
	registerData = req.body;
	userCollection.insertOne(registerData, (err, result) => {
		if (err) {
			console.error("Error inserting new user: ", err);
			res.status(500).send("Error inserting new user");
		} else {
			console.log("New user inserted with ID: ", result.insertedId);
			res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
		}
	});

});


app.post('/postOrderData', function (req, res) {

	console.log("POST request received for saving data : " + JSON.stringify(req.body) + "\n");

	orderCollection.insertOne(req.body, function (err, result) {
		if (err) {
			console.log("Some error.. " + err + "\n");
			res.send(err);
		} else {
			console.log("Order record with ID " + result.insertedId + " have been inserted\n");
			res.status(200).send(result);
		}

	});
});

app.get('/getCustomerOrders', (req, res) => {
	console.log("Get request received for orders of current user: " + JSON.stringify(req.query) + "\n");
	orderCollection.find({ customerEmail: req.query.email }).toArray(function(err, orders)  {
		if (err) {
			console.error("Error fetching orders email: ", err);
			res.status(500).send("error fetching orders");
		} else {
			res.status(200).json({ data: orders });
		}
	});

});

app.delete('/deleteOrders', (req,res) => {
	console.log("Delete request received for : " + JSON.stringify(req.body) + "\n");
	const orderNos = req.body.orderNos;

	if (!Array.isArray(orderNos) || orderNos.length === 0) {
        return res.status(400).send({ error: 'No order numbers provided' });
    }

	orderCollection.deleteMany({ orderNo: { $in: orderNos } }, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Failed to delete orders' });
        }
        res.send({ deletedCount: result.deletedCount });
    });

});


app.listen(port, () => {
	console.log(`Gift Delivery server app listening at http://localhost:${port}`)
});
