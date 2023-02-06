import {complete_prompt} from "../query-gpt.js"

// Math helpers
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length
const geom_mean = (xs) => {
  const logs = xs.map(Math.log)
  const mean_of_logs = mean(logs)
  return Math.exp(mean_of_logs)
}

const filter_ps = ps => {
  return ps.filter(p => p !== null).filter(p => ((p < 1) && (p > 0)))
}

// Utils
const generate_prompt = question => `Many good forecasts are made in two steps.

1. Look at the base rate or historical frequency to arrive at a baseline probability.
2. Take into account other considerations and update the baseline slightly.

For example, we can answer the question "will there be a schism in the Catholic Church in 2023?" as follows:

1. There have been around 40 schisms in the 2000 years since the Catholic Church was founded. This is a base rate of 40 schisms / 2000 years  = 2% chance of a schism / year. If we only look at the last 100 years, there have been 4 schisms, which is a base rate of 4 schisms / 100 years = 4% chance of a schism / year. In between is 3%, so we will take that as our baseline. 
2. The Catholic Church in Germany is currently in tension and arguing with Rome. This increases the probability a bit, to 5%.

Therefore, our final probability for "will there be a schism in the Catholic Church in 2023?" is: 5%

For another example, we can answer the question "${question}" as follows:`

// Main functions
export const predict_with_verbal_prompt_once = async (question) => {
  const prompt = generate_prompt(question)
  const answer = await complete_prompt(prompt, 200)
  const answer_words = answer.split(" ")
  const extracted_probability = Number(answer_words[answer_words.length - 1].replace("%", "")) / 100
  const response = ({reasoning: answer, extracted_probability: extracted_probability})
  // console.log(answer)
  return response

}

export const predict_with_verbal_prompt = async (question) => {
  const questions = Array(50).fill(question)
  const answered_questions = questions.map(question => predict_with_verbal_prompt_once(question))
  const answered_questions_awaited = await Promise.all(answered_questions)
  const reasonings = answered_questions_awaited.map(answer => answer.reasoning)
  const extracted_probabilities = answered_questions_awaited.map(answer => answer.extracted_probability)

  const filtered_probs = filter_ps(extracted_probabilities)
  const aggregate_probability = geom_mean(filtered_probs)

  const response = ({aggregate_probability: aggregate_probability, reasonings: reasonings, probabilities: extracted_probabilities})

  // console.log(response)
  // console.log(aggregate_probability)

  return response

}

// predict_with_verbal_prompt("At the end of 2023, will Vladimir Putin be President of Russia?")