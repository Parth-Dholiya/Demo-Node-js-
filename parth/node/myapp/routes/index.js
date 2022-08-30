var express = require('express');
var router = express.Router();
var bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
var user = require('../modules/users');
var passcate = require('../modules/password_category');
const { body, validationResult } = require('express-validator');


function cheakuserlogin(req, res, next) {
  var usertoken = localStorage.getItem('usertoken');
  try {
    var decoded = jwt.verify(usertoken, 'loginToken');
  } catch (err) {
    res.redirect('/')
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function ckeckeuname(req, res, next) {
  var uname = req.body.uname;
  var unamechek = user.findOne({ uname: uname });
  unamechek.exec((err, data) => {
    if (err) throw error;
    if (data) {
      return res.render('signup', { title: 'signup', msg: "User Already Exit" });
    }
    next();
  });
}

function ckeckemail(req, res, next) {
  var email = req.body.email;
  var emailchek = user.findOne({ email: email });
  emailchek.exec((err, data) => {
    if (err) throw error;
    if (data) {
      return res.render('signup', { title: 'signup', msg: "Email Already Exit" });
    }
    next();
  });
}

/* GET home page. */
router.get('/', function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  if (loginuser) {
    res.redirect('/dashboard');
  } else {
    res.render('index', { title: 'login', msg: '' });
  }
});

router.post('/', function (req, res, next) {

  var uname = req.body.uname;
  var password = req.body.password;

  var cheakuser = user.findOne({ uname: uname });
  cheakuser.exec((err, data) => {
    if (err) throw error;
    var UserId = data._id;
    var getpassword = data.password;

    if (bcrypt.compareSync(password, getpassword)) {
      var token = jwt.sign({ UId: 'UserId' }, 'loginToken');
      localStorage.setItem('usertoken', token);
      localStorage.setItem('loginuser', uname);

      res.redirect('/dashboard');

    } else {
      res.render('index', { title: 'login', msg: "Invaild UserName and Password......!" });
    }
  });
});

router.get('/dashboard', cheakuserlogin, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  res.render('dashboard', { title: 'dashboard', loginUser: loginuser, msg: '' });
});

router.get('/signup', cheakuserlogin, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  if (loginuser) {
    res.redirect('/dashboard');
  } else {
    res.render('signup', { title: 'signup', msg: '' });
  }
});

router.post('/', ckeckeuname, ckeckemail, function (req, res, next) {

  var uname = req.body.uname
  var email = req.body.email
  var password = req.body.password
  var confpassword = req.body.confpassword

  if (password != confpassword) {
    res.render('signup', { title: 'signup', msg: "Password Is No Match" });

  } else {
    var hash = bcrypt.hashSync(password, 12);
    var userdetails = new user({
      uname: uname,
      email: email,
      password: hash
    });

    userdetails.save((err, data) => {
      if (err) throw error
      res.render('signup', { title: 'signup', msg: "User Records SuccessFully", data });
    });
  }

});

router.get('/Add-New-Category', cheakuserlogin, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  res.render('addnewcategory', { title: 'AddNewCategory', loginUser: loginuser, errors: '', sucess: '' });
});

router.post('/Add-New-Category', cheakuserlogin, [body('passwordcategoryname', 'Enter Password Category Name').isLength({ min: 2 })], function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addnewcategory', { title: 'AddNewCategory', loginUser: loginuser, errors: errors.mapped(), sucess: '' });
  }
  else {
    var passwordcategoryname = req.body.passwordcategoryname;
    var password_category = new passcate({
      passwordcategoryname: passwordcategoryname
    });
    password_category.save();
    res.render('addnewcategory', { title: 'AddNewCategory', loginUser: loginuser, errors: '', sucess: "Passwrod Category Inserted SuccessFully....!" });
  }
});

router.get('/passwordcategory', cheakuserlogin, async function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  const data = await passcate.find({})
  res.render("password_category", { title: "Password Category", loginUser: loginuser, records: data });
});

router.get('/passwordcategory/delete/:id', cheakuserlogin, async function async(req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  var passcate_id = req.params.id;
  const data = await passcate.findByIdAndRemove(passcate_id)
  res.redirect("/passwordcategory");
});

router.get('/passwordcategory/edit/:id', cheakuserlogin, async function async(req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  var passcate_id = req.params.id;
  const data = await passcate.findById(passcate_id);
  res.render("edit_pass_category", { title: "Password Category", loginUser: loginuser, errors: '', sucess: '', records: data, id: passcate_id });
});

router.post('/passwordcategory/edit', cheakuserlogin, async function async(req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  var passcate_id = req.body.id;
  var passwordcategoryname = req.body.passwordcategoryname;
  const updatedata = await passcate.findByIdAndUpdate(passcate_id, { passwordcategoryname: passwordcategoryname });
  res.redirect('/passwordcategory')
});

router.get('/Add-New-Password', cheakuserlogin, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  res.render('addnewpassword', { title: 'AddNewPassword', loginUser: loginuser });
});

router.get('/View-All-Password', cheakuserlogin, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser');
  res.render('view-all-password', { title: 'ViewAllPassword', loginUser: loginuser });
});

router.get('/logout', cheakuserlogin, function (req, res, next) {
  localStorage.removeItem('usertoken');
  localStorage.removeItem('loginuser')
});

module.exports = router;
