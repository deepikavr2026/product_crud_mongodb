const http=require('http');
const {MongoClient,objectId}=require('mongodb');

//Mongodb connection

const mongoURL="mongodb://127.0.0.1:27017"
const client=new MongoClient(mongoURL);
let productCollection;

async function connectDB(){
    try{
        await client.connect();
        console.log("Mongodb connected successfully");
        const database=client.db("productDB");
        productCollection=database.collection("product");
    }catch(error){
        console.log("Mongodb connection error:",error);
    }
}

connectDB();

const server=http.createServer(async(req,res)=>{
    //response header
    res.setHeader("content-type","application/json");

    //get all products

    if(req.url==='/getProduct' && req.method==="GET"){
        try{
            const product=await productCollection.find().toArray();
            res.statusCode=200;
            res.end(JSON.stringify({
                message:"Products details fetched successfully",
                product:product
            }))

        }catch(error){
            console.log(error);
            res.statusCode=500;
            res.end(JSON.stringify({
                message:"Fetched failed"
            }));
            
        }
    }

    //post product
    else if(req.url==='/addproduct' && req.method==="POST"){
        let body="";
        req.on("data",(chunk)=>{
            body+=chunk.toString();
        });
        req.on("end",async()=>{
            try{
                const newProduct=JSON.parse(body);
                const product={
                    name:newProduct.name,
                    price:Number(newProduct.price)
                    
                }

                const result=await productCollection.insertOne(product);
                res.statusCode=201;
                res.end(JSON.stringify({
                    message:"Product data added successfully",
                    product:{
                        _id:result.insertedId,
                        ...product
                    }
                }))

            }catch(error){
                console.log(error);
                res.statusCode=500;
                res.end(JSON.stringify({
                    message:"Failed to add ptoduct"
                }))
                
            }
        })
    }
});

server.listen(3000,()=>{
    console.log("Server running at http://localhost:3000");
    
})