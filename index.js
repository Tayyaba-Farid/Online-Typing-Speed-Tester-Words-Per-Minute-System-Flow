#! /usr/bin/env node
import inquirer from 'inquirer';
import chalk from "chalk";
// User Management
class User {
    name;
    email;
    password;
    gender;
    constructor(name, email, password, gender) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.gender = gender;
    }
}
const passages = {
    'Easy: Random sentences': "The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. He plays basketball every Sunday.",
    'Medium: Random words': "Ambiguous, Facetious, Ineffable, Conundrum, Galvanize, Labyrinth, Mellifluous",
    'Difficult: Technical text': "The advancement of artificial intelligence (AI) has revolutionized various industries, including healthcare, finance, and manufacturing. Machine learning algorithms, such as neural networks and decision trees, are used to analyze large datasets and make predictions with unprecedented accuracy. Additionally, natural language processing (NLP) techniques enable computers to understand and generate human language."
};
const calculateWPM = (typedText, timeTaken) => {
    const words = typedText.trim().split(/\s+/).length;
    return Math.round(words / timeTaken);
};
const highlightMistakes = (original, typed) => {
    const originalWords = original.split(" ");
    const typedWords = typed.split(" ");
    return originalWords
        .map((word, index) => (word === typedWords[index] ? word : `\x1b[31m${typedWords[index] || ""}\x1b[0m`))
        .join(" ");
};
async function speedTester() {
    console.log(chalk.cyanBright("Welcome to the Online Typing Speed Tester!"));
    console.log(chalk.cyan("This program will calculate your typing speed in words per minute and show your WPM score."));
    let emailInfo = {};
    let loggedInUser = null;
    let exit = false;
    while (!exit) {
        let user = await inquirer.prompt([{
                name: "userInfo",
                type: "list",
                message: "Please choose one option: ",
                choices: ["Login", "Signup", "Exit"]
            }]);
        if (user.userInfo === "Signup") {
            let { name, email, password, gender } = await inquirer.prompt([
                { name: "name", type: "input", message: "Please enter your name: ", validate: input => isNaN(input) ? true : "Invalid input!" },
                { name: "email", type: "input", message: "Please enter your email: ", validate: input => isNaN(input) ? true : "Please enter correct email" },
                { name: "password", type: "input", message: "Please enter your password: " },
                { name: "gender", type: "list", message: "Please choose your gender: ", choices: ["Female", "Male"] }
            ]);
            let signedUpUser = new User(name, email, password, gender);
            emailInfo[signedUpUser.email] = signedUpUser;
            console.log(chalk.greenBright("User signed up successfully!"));
            loggedInUser = signedUpUser;
        }
        else if (user.userInfo === "Login") {
            let { email, password } = await inquirer.prompt([
                { name: "email", type: "input", message: "Please enter your email: ", validate: input => isNaN(input) ? true : "Please enter valid Email!" },
                { name: "password", type: "input", message: "Please enter your password: " }
            ]);
            const signedUpUser = emailInfo[email];
            if (!signedUpUser || signedUpUser.password !== password) {
                console.log(chalk.redBright("User not found or incorrect password!"));
                process.exit();
            }
            else {
                console.log(chalk.greenBright("Successfully logged in!"));
                loggedInUser = signedUpUser;
            }
        }
        else {
            process.exit();
        }
        if (loggedInUser) {
            let { DifficultyLevel, TestDuration } = await inquirer.prompt([
                { name: "DifficultyLevel", type: "list", message: "Please choose the difficulty level for your Typing speed test: ", choices: ["Easy: Random sentences", "Medium: Random words", "Difficult: Technical text"] },
                { name: "TestDuration", type: "list", message: "Please choose a test duration: ", choices: ["1 minute", "2 minutes", "3 minutes"] }
            ]);
            console.log("DifficultyLevel:", DifficultyLevel); // Debugging statement
            const passage = passages[DifficultyLevel];
            console.log("Passage:", passage); // Debugging statement
            console.log("Place your fingers in the proper typing position.");
            await inquirer.prompt([{ name: "ready", message: "Press Enter when ready...", type: "input" }]);
            console.log("Start typing:\n" + passage);
            const startTime = Date.now();
            const { typedText } = await inquirer.prompt([{ name: "typedText", message: "Type here:", type: "input" }]);
            const endTime = Date.now();
            const timeTaken = Math.max((endTime - startTime) / 1000 / 60, 0.1); // time in minutes
            const wpm = calculateWPM(typedText, timeTaken);
            const highlightedText = highlightMistakes(passage, typedText);
            console.log(chalk.greenBright(`You typed at ${wpm} WPM.`));
            console.log(`Typed text with mistakes highlighted:\n${highlightedText}`);
        }
    }
}
speedTester();
