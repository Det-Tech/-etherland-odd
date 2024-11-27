import type { Components } from "../../../components.js"
import type { Dependencies } from "./base.js"
import type { Channel, ChannelOptions } from "../channel.js"
import type { Implementation } from "../implementation.js"

import * as Base from "./base.js"
import * as ChannelFission from "./fission/channel.js"
import * as ChannelMod from "../channel.js"
import * as Fission from "./fission/index.js"

// @ts-ignore
import { Client, JsonError } from '../../../sdk/index'
import { Agent } from '@fission-codes/ucan/agent'
import { EdDSASigner } from 'iso-signatures/signers/eddsa.js'

const SERVER_URL = process.env.SERVER_URL || 'https://auth.etherland.world'

export function createChannel(
  endpoints: Fission.Endpoints,
  dependencies: Dependencies,
  options: ChannelOptions
): Promise<Channel> {
  return ChannelMod.createWssChannel(
    dependencies.reference,
    ChannelFission.endpoint(
      `${endpoints.server}${endpoints.apiPath}`.replace(/^https?:\/\//, "wss://")
    ),
    options
  )
}

export const isUsernameAvailable = async (endpoints: Fission.Endpoints, username: string): Promise<boolean> => {
  return Fission.isUsernameAvailable(endpoints, username)
}

export const isUsernameValid = async (username: string): Promise<boolean> => {
  return Fission.isUsernameValid(username)
}

export const emailVerify = async (
  endpoints: Fission.Endpoints,
  dependencies: Dependencies,
  options: { email?: string }
): Promise<{ success: boolean }> => {
  const { success } = await Fission.emailVerify(endpoints, options)
  return { success: success }
}

const resolveSigner = (
  exported : string | CryptoKeyPair | undefined
) => {
  if (typeof exported === 'string') {
    return EdDSASigner.import(exported)
  }

  return EdDSASigner.generate()
}

let client: any;

export const register = async (
  endpoints: Fission.Endpoints,
  dependencies: Dependencies,
  options: { username: string; email: string, code: string, hashedUsername: string }
): Promise<{ success: boolean }> => {
  // const { success } = await Fission.createAccount(endpoints, dependencies, options)
  console.log("endpoints ", endpoints);
  
  const agent = await Agent.create({
    resolveSigner,
  })

  console.log("agent ", agent)
  localStorage.setItem("agent", JSON.stringify(agent))

  client = await Client.create({
    url: SERVER_URL,
    agent,
  })

  console.log("client ", client)

  // const out = await client.verifyEmail(email)

  const createAccount = await client.accountCreate({
    code: options.code,
    email: options.email,
    username: options.username,
  })
  localStorage.setItem("user", JSON.stringify(createAccount.result))
  localStorage.setItem("ucans", JSON.stringify(client?.session?.ucans))
  console.log("createAccount.........", createAccount)
  console.log("client&&& ", client)
  return Base.register(dependencies, { ...options, type: Base.TYPE })
  return { success: false }
}

export const getAccountInfo = async (
): Promise<{ data: any }> => {
  try{

    // const { success } = await Fission.createAccount(endpoints, dependencies, options)
    console.log("endpoints ", "endpoints");
  
    const agentData: any = localStorage.getItem("agent")
    if(!agentData)return { data: null};
    if(!client) {
      const _agentData = JSON.parse(agentData);
      

      console.log("creating client again ", resolveSigner)
      const agent = new Agent({
        store: _agentData.store,
        signer: _agentData.signer,
      })

    
      console.log("agent ", agent)
      console.log("agent ", localStorage.setItem("agent", JSON.stringify(agent)))
      console.log("agent ", localStorage.getItem("agent"))
  
      client = await Client.create({
         url: SERVER_URL,
         agent,
      })
    }
  
  
    console.log("getAccountInfo123123 client ", client)
  
    // const out = await client.verifyEmail(email)
    const user: any = localStorage.getItem("user");
    const ucans: any = localStorage.getItem("ucans");
    console.log("user did.........", user, JSON.parse(user)?.did)
    console.log("user ucans.........", user, JSON.parse(ucans))
    const accountInfo = await client.accountInfo(JSON.parse(user)?.did)
    console.log("accountInfo.........", accountInfo)
    return { data: accountInfo?.result}
  }catch(err){
    return { data: null};
  }
}

// 🛳


export function implementation(
  endpoints: Fission.Endpoints,
  dependencies: Dependencies
): Implementation<Components> {
  const base = Base.implementation(dependencies)

  return {
    type: base.type,

    canDelegateAccount: base.canDelegateAccount,
    delegateAccount: base.delegateAccount,
    linkDevice: base.linkDevice,
    session: base.session,

    isUsernameValid,


    createChannel: (...args) => createChannel(endpoints, dependencies, ...args),
    isUsernameAvailable: (...args) => isUsernameAvailable(endpoints, ...args),
    register: (...args) => register(endpoints, dependencies, ...args),

    emailVerify: (...args) => emailVerify(endpoints, dependencies, ...args)

  }
}
