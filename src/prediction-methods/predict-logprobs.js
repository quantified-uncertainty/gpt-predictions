import {get_completion_probabilities} from "../query-gpt.js"


let process_logprobs = (logprobs) => {
  if (!!logprobs ?. ["Yes"] && !!logprobs ?. ["No"]) {
    let prob_yes = Math.exp(logprobs["Yes"])
    let prob_no = Math.exp(logprobs["No"])
    let normalized_prob_yes = prob_yes / (prob_yes + prob_no)
    // let normalized_prob_no = prob_no / (prob_yes + prob_no)
    return normalized_prob_yes

  } else if (!!logprobs ?. ["No"]) {
    let prob_no = 0
    let prob_else = 0
    for (let option in logprobs) {
      let lc_option = option.toLowerCase()
      if (lc_option.includes("no")) {
        prob_no += Math.exp(logprobs[option])
      } else if (! lc_option.includes("yes")) {
        prob_else += Math.exp(logprobs[option])
      }
    }
    let prob_yes = 1 - prob_no - prob_else
    let normalized_prob_yes = prob_yes / (prob_yes + prob_no)
    return normalized_prob_yes
  } else if (!!logprobs ?. ["Yes"]) {
    let prob_yes = 0
    let prob_else = 0
    for (let option in logprobs) {
      let lc_option = option.toLowerCase()
      if (lc_option.includes("yes")) {
        prob_yes += Math.exp(logprobs[option])
      } else if (! lc_option.includes("no")) {
        prob_else += Math.exp(logprobs[option])
      }
    }
    let prob_no = 1 - prob_yes - prob_else
    let normalized_prob_yes = prob_yes / (prob_yes + prob_no)
    return normalized_prob_yes
  } else {
    return null;
  }
}

export const predict_with_logprobs = async (question) => {
  const question_logprob_form = `${question} [Yes/No]

  ` // new lines are important, so that GPT doesn't feel the need to add more.
  let response = await get_completion_probabilities(question_logprob_form)
  let prob_yes = process_logprobs(response.top_logprobs ?. [0])
  return prob_yes // either a probability or null.
}


