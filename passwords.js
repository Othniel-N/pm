const express = require('express');
const User = require('./user');
const router = express.Router();
const CryptoJS = require('crypto-js');

// Encryption key (use a secure method to store and manage this key)
const encryptionKey = 'your-encryption-key';

// Encrypt function
function encryptPassword(password) {
  return CryptoJS.AES.encrypt(password, encryptionKey).toString();
}

// Decrypt function
function decryptPassword(encryptedPassword) {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Endpoint to add a password for a user
router.post('/:username/passwords', async (req, res) => {
    const { username } = req.params;
    const { accountname, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if the accountname already exists in the passwords array
      const existingPassword = user.passwords.find(p => p.accountname === accountname);
      if (existingPassword) {
        return res.status(400).json({ message: 'Account name must be unique' });
      }
  
      const encryptedPassword = encryptPassword(password);
  
      // Add the new password entry to the user's passwords array
      user.passwords.push({ accountname, password: encryptedPassword });
      await user.save();
  
      // Respond with success message and the updated passwords array
      res.status(201).json({ message: 'Password added successfully', passwords: user.passwords });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
// Endpoint to get all passwords for a user
router.get('/:username/passwords', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const decryptedPasswords = user.passwords.map(entry => ({
      _id: entry._id,
      name: entry.accountname,
      password: decryptPassword(entry.password),
      createdAt: entry.createdAt
    }));

    res.status(200).json({ passwords: decryptedPasswords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint to update a password for a user
router.put('/:username/passwords/:passwordId', async (req, res) => {
  const { username, passwordId } = req.params;
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordEntry = user.passwords.id(passwordId);
    if (!passwordEntry) {
      return res.status(404).json({ message: 'Password entry not found' });
    }

    passwordEntry.name = name;
    passwordEntry.password = encryptPassword(password);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully', passwords: user.passwords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Endpoint to delete a password for a user
router.delete('/:username/passwords/:passwordId', async (req, res) => {
  const { username, passwordId } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordEntry = user.passwords.id(passwordId);
    if (!passwordEntry) {
      return res.status(404).json({ message: 'Password entry not found' });
    }

    passwordEntry.remove();
    await user.save();

    res.status(200).json({ message: 'Password deleted successfully', passwords: user.passwords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
