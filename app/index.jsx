import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

const LoginPage = () => {
  const router = useRouter();
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // You could add authentication logic here before navigating
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Page</Text>

      <TextInput
        style={styles.input}
        placeholder="Login Name"
        value={loginName}
        onChangeText={setLoginName}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
