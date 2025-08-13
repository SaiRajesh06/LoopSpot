import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Home = () => {
    return (
        <View>
            <Text>Login Page</Text>
            <Link href="/home">
                LOGIN
            </Link>
        </View>

    )
}

export default Home

const styles = StyleSheet.create({})