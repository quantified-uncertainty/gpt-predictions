// Imports
import axios from "axios"
import * as dotenv from 'dotenv'

// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

// Get dotenvs
dotenv.config({path: "/home/loki/Documents/core/software/fresh/js/gpt-predictions/.env"})
const OPEN_AI_BEARER = process.env.OPEN_AI_BEARER;

// Utils
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function make_axios_request(prompt, max_tokens = 200) {
  let response = await axios({
    method: 'post',
    url: 'https://api.openai.com/v1/engines/text-davinci-003/completions',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPEN_AI_BEARER}`
    },
    data: {
      "prompt": prompt,
      "max_tokens": max_tokens, // should be a healthy amount
    }
  });
  return response
}

export async function complete_prompt(prompt, max_tokens = 200) {
  let response

  // Try twice
  try {
    response = await make_axios_request(prompt, max_tokens)

  } catch (error) { // console.log(error)
		console.log(JSON.stringify(error, null, 2))
    console.log("Error #1, trying again")
    await sleep(10 * 1000); // 10s <- not working
    response = await make_axios_request(prompt, max_tokens)
    // if ^ emits a new error, it isn't caught
  }

  // Examine response
  if (response.status == 200) {
    let completion = response ?. data ?. choices ?. [0] ?. text
    if (completion != undefined) {
      return completion
    }
  } else {
    console.log(response)
    throw new Error("Axios request did not contain completion")
  }

};
// query_open_ai_endpoint("What is the answer to life, the universe and everything?")

export async function get_completion_probabilities(prompt) {
  let response = await axios({
    method: 'post',
    url: 'https://api.openai.com/v1/engines/text-davinci-003/completions',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPEN_AI_BEARER}`
    },
    data: {
      "prompt": prompt,
      max_tokens: 1,
      logprobs: 6
    }
  });

  if (response.status == 200) {
    let completion = response ?. data ?. choices ?. [0] ?. logprobs
    // console.log(completion)
    if (completion != undefined) {
      return completion
    }
  }

  return null
}

// let prompt = `Will Vladimir Putin be President of Russia by the end of 2023? [Yes/No]: `

// get_completion_probabilities(prompt)
