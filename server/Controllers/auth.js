const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const {
      name,
      password,
      phoneNumber,
      email,
      address,
      province,
      postalCode,
    } = req.body;

    var user = await User.findOne({ name });
    if (user) {
      return res.send("User Already!!!").status(400);
    }

    const salt = await bcrypt.genSalt(10);
    user = new User({
      name,
      password,
      phoneNumber,
      email,
      address,
      province,
      postalCode,
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
    const { name, password } = req.body;
    var user = await User.findOneAndUpdate({ name }, { new: true });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.send("รหัสผ่านผิด").status(400);
      }

      var payload = {
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) throw err;
          res.json({ token, payload });
        }
      );
    } else {
      return res.send("User not found!!!").status(400);
    }
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
