import inquirer from 'inquirer';
import chalk from "chalk";

class User {
  name: string;
  email: string;
  password: string | number;
  gender: string;

  constructor(name: string, email: string, password: string | number, gender: string) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.gender = gender;
  }
}

const passages = {
  'Easy: Random sentences':"The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. He plays basketball every Sunday. She sells seashells by the seashore. A watched pot never boils. Actions speak louder than words. Birds of a feather flock together. Every cloud has a silver lining. A journey of a thousand miles begins with a single step. Better late than never. Practice makes perfect. When it rains, it pours. The early bird catches the worm. Laughter is the best medicine.A picture is worth a thousand words. Fortune favors the bold. The grass is always greener on the other side. Haste makes waste. Look before you leap.",
  'Medium: Random words': "Ambiguous, Facetious, Ineffable, Conundrum, Galvanize, Labyrinth, Mellifluous, Serendipity, Ephemeral, Quixotic, Nefarious, Verisimilitude, Soliloquy, Obfuscate, Incorrigible, Inequitable, Transcendental, Obstreperous, Mellifluous, Perfunctory, Quagmire, Reticent, Sycophant, Ubiquitous, Vicarious, Discombobulate, Perspicacious, Disingenuous",
  'Difficult: Technical text': "The advancement of artificial intelligence (AI) has revolutionized various industries, including healthcare, finance, and manufacturing. Machine learning algorithms, such as neural networks and decision trees, are used to analyze large datasets and make predictions with unprecedented accuracy. Additionally, natural language processing (NLP) techniques enable computers to understand and generate human language. The integration of AI in autonomous vehicles promises to enhance safety and efficiency in transportation. Furthermore, AI-driven diagnostic tools are improving early detection and treatment of diseases. The ethical implications of AI, including privacy concerns and algorithmic bias, are critical areas of ongoing research. As AI continues to evolve, its impact on employment, data security, and human interaction remains a subject of significant debate."
};

type PassageKeys = keyof typeof passages;

async function countdownTimer(minutes: number): Promise<void> {
  let seconds = minutes * 60;

  const interval = setInterval(() => {
    seconds--;

    if (seconds <= 0) {
      clearInterval(interval);
      console.log(chalk.redBright("\nTimer has expired!"));
    }
  }, 1000);
}

async function startTypingTest(passage: string, durationInMinutes: number): Promise<void> {
  console.log("Start typing:");
  const startTime = Date.now();
  let typedText = "";

  while ((Date.now() - startTime) / 1000 / 60 < durationInMinutes) {
    const { userInput } = await inquirer.prompt([{ name: "userInput", message: "Type here:", type: "input" }]);
    typedText += userInput + " ";
  }

  const passageWords = passage.split(/\s+/);
  const typedWords = typedText.trim().split(/\s+/);
  let mistakes = 0;

  // Count the number of mismatched words
  for (let i = 0; i < typedWords.length; i++) {
    if (typedWords[i] !== passageWords[i]) {
      mistakes++;
    }
  }

  const wpm = Math.round(typedWords.length / durationInMinutes);
  console.log(`Your words per minute are: ${wpm}`);
  console.log(`Number of mistakes: ${mistakes}`);
}

async function speedTester() {
  console.log(chalk.cyanBright("Welcome to the Online Typing Speed Tester!"));
  console.log(chalk.cyan("This program will calculate your typing speed in words per minute and show your WPM score."));

  let emailInfo: { [email: string]: User } = {};
  let loggedInUser: User | null = null;

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
    } else if (user.userInfo === "Login") {
      let { email, password } = await inquirer.prompt([
        { name: "email", type: "input", message: "Please enter your email: ", validate: input => isNaN(input) ? true : "Please enter valid Email!" },
        { name: "password", type: "input", message: "Please enter your password: " }
      ]);

      const signedUpUser = emailInfo[email];

      if (!signedUpUser || signedUpUser.password !== password) {
        console.log(chalk.redBright("User not found or incorrect password!"));
        process.exit();
      } else {
        console.log(chalk.greenBright("Successfully logged in!"));
        loggedInUser = signedUpUser;
      }
    } else {
      process.exit();
    }

    if (loggedInUser) {
      let { DifficultyLevel, TestDuration } = await inquirer.prompt([
        { name: "DifficultyLevel", type: "list", message: "Please choose the difficulty level for your Typing speed test: ", choices: ["Easy: Random sentences", "Medium: Random words", "Difficult: Technical text"] },
        { name: "TestDuration", type: "list", message: "Please choose a test duration: ", choices: ["1 minute", "2 minutes", "3 minutes"] }
      ]);
      let durationInMinutes: number = 0;
      switch (TestDuration) {
        case '1 minute':
          durationInMinutes = 1;
          break;
        case '2 minutes':
          durationInMinutes = 2;
          break;
        case '3 minutes':
          durationInMinutes = 3;
          break;
      }

      console.log("DifficultyLevel:", DifficultyLevel);
      const passage = passages[DifficultyLevel as PassageKeys];
      console.log("Passage:", passage);

      console.log("Place your fingers in the proper typing position.");
      await inquirer.prompt([{ name: "ready", message: "Press Enter when ready...", type: "input" }]);

      await countdownTimer(parseInt(TestDuration.split(" ")[0]));
      await startTypingTest(passage, durationInMinutes);
    }
  }
}

speedTester();