const express = require("express");
const {body,validationResult} = require("express-validator");
const mysql = require("mysql");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// mysql connection
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'MysqlNodejs_api',
})

connection.connect((err)=>{
    if(err){
        console.log("Can not connecting to MySQL.")
        return;
    }
    console.log("Connected to MySQL.")
})

// add user to mysql
app.post("/create",(req,res)=>{
    const {email,name,password,codeEtc} =req.body;
    try{
        console.log("อยู่ใน post(/create) แล้ว");
        console.log("ค่าของ req.body.email = "+req.body.email);
        connection.query("INSERT INTO users(email,fullname,password,codeEtc) VALUES(?,?,?,?)",[email,name,password,codeEtc]),(err,result,fields)=>{
            if(err){
                console.log("Error while insert user to MySQL.")
                res.status(400).send();
            }
            console.log("จบการทำงาน insert user")
            return res.status(201).json({message:"Insert new user successfully."})
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).send();
    }
})

// read user data
app.get("/read",(req,res)=>{
    try{
        connection.query("SELECT * FROM users",(err,result,fields)=>{
            if(err){
                console.log("Error to read user data.");
                return res.status(400).send();
            }
            return res.status(200).json(result);
        })
    } catch(err){
        console.log(err);
        return res.status(500).send();
    }
})
// read user data by inner join
app.get("/readbydepart",(req,res)=>{
    const officeID= req.params.offID;
    try{
            connection.query("SELECT users.id, users.email, users.fullname, departments.namedepart FROM users INNER JOIN departments ON users.codeEtc = departments.codeEtc",(err,result,fields)=>{
                if(err){
                    console.log("Error to read user data.");
                    return res.status(400).send();
                }
                return res.status(200).json(result);
            })
    } catch(err){
        console.log(err);
        return res.status(500).send();
    }
})

// update user
app.patch("/update/:id",async (req,res)=>{
    const id = req.params.id;
    const name = req.body.name;
    const newPassword = req.body.password;
    try{
        if(name && newPassword){
            console.log("ค่า name และ newPassword ที่ต้องการอัพเดต :"+name+newPassword);
            connection.query("UPDATE users SET fullname =?, password=? WHERE id=?",[name,newPassword,id],(err,result,fields)=>{
                if(err){
                    console.log("Error to upadte user's data (condition1) : "+err);
                    return res.status(400).send();
                }
                return res.status(201).json({
                    message:" User name and password update successfully"
                })
            });
        } else if(name && !newPassword){
            console.log("ค่า name  ที่ต้องการอัพเดต :"+name);
            connection.query("UPDATE users SET fullname =? WHERE id=?",[name,id],(err,result,fields)=>{
                if(err){
                    console.log("Error to upadte user's data (condition2) : "+err);
                    return res.status(400).send();
                }
                return res.status(201).json({
                    message:" User name update successfully"
                })
            });
        }  else if(!name && newPassword) {
            console.log("ค่า newPassword ที่ต้องการอัพเดต :"+newPassword);
            connection.query("UPDATE users SET password =? WHERE id=?",[newPassword,id],(err,result,fields)=>{
                if(err){
                    console.log("Error to update user's data (condition3) : "+err);
                    return res.status(400).send();
                }
                return res.status(201).json({
                    message:" User password update successfully"
                })
            });
        } else{
            console.log("Please enter user'data")
            return res.status(400).send()
        }
    }catch(err){
        console.log(err);
        return res.status(500).send();
    }

})
// delete user by userID
app.delete("/delete/:userid",(req,res)=>{
    const id = req.params.userid;
    try{
        if(id){
            console.log("ค่า userID ที่ต้องการลบ :"+id);
            connection.query("DELETE FROM users WHERE id=?",[id],(err,results,fields)=>{
                if(err){
                    console.log("Error while delete user from MySQL.")
                    res.status(400).send();
                }
                if(results.affectedRows === 0){
                    res.status(404).json({message:"No userID for delete data"});
                }
                res.status(200).json({message:"User deleted successfully"});
            })
        } else{
            console.log("Please enter user'id for delete data")
                return res.status(400).send()
        }
    } catch(err){

    }
});


app.listen(3000,()=>{
    console.log("Server is runnign on port 8889.")
})