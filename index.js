import {scott_alexander_questions} from "./data/scott-questions.js"
import {predict_with_logprobs} from "./src/prediction-methods/predict-logprobs.js"
import {predict_with_verbal_prompt} from "./src/prediction-methods/predict-verbally.js"


(async function() {
  for (let question of scott_alexander_questions) {
    
    // Interpreting logprobs as probabilities
    const prob_yes_logprob = await predict_with_logprobs(question)
    

    // Using verbal prediction method
    const verbal_response = await predict_with_verbal_prompt(question)
    const prob_yes_verbal = verbal_response.aggregate_probability

    // Console.log
    console.log(question)
    console.log(prob_yes_logprob)
    console.log(prob_yes_verbal)
    console.log()
    console.log("\n")

  }
})()