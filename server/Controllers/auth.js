const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    //CheckUser
    const { name, password, tol, email } = req.body;

    var user = await User.findOne({ name });
    if (user) {
      return res.send("User Already!!!").status(400);
    }

    //Encrypt(เข้ารหัส password)
    const salt = await bcrypt.genSalt(10);
    user = new User({
      name,
      password,
      tol,
      email,
    });

    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.send("Register Success");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  try {
    //Check User
    const { name, password } = req.body;
    var user = await User.findOneAndUpdate({ name }, { new: true });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.send("Password Invalid!!!").status(400);
      }

      //Payload
      var payload = {
        user: { id: user.id, name: user.name, role: user.role },
      };

      //Genarate token
      jwt.sign(payload, "jwtsecret", { expiresIn: "1d" }, (err, token) => {
        if (err) throw err;
        res.json({ token, payload });
      });
    } else {
      return res.send("User not found!!!").status(400);
    }

    // res.send('Hello login Controller')
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await User.findOne({ name: req.user.name })
      .select("-password")
      .exec();
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
