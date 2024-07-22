const express = require('express');
const User = require('./user');
const router = express.Router();

// Endpoint to add a password for a user
router.post('/:username/passwords', async (req, res) => {
  const { username } = req.params;
  const { name, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.passwords.push({ name, password });
    await user.save();

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

    res.status(200).json({ passwords: user.passwords });
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
    passwordEntry.password = password;
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
