// @ts-ignore
import type { Agent } from './ucan/src/agent'

import type { JWT } from './ucan/src/types'
import type { DID, VerifiableDID } from 'iso-did/types'
import type { Errors, JsonError } from 'iso-web/http'

// @ts-ignore
export type * from './schemas'

export type { DID } from 'iso-did/types'
export type { MaybeResult } from 'iso-web/types'
export type { Errors, JsonError } from 'iso-web/http'

export type ClientErrors = Errors | JsonError

export interface ClientOptions {
  url: string
  did: VerifiableDID
  agent: Agent
}

export interface AccountInfo {
  did: DID
  username: string
  email: string
}

export interface Session {
  account: AccountInfo
  ucans: JWT[]
}

export interface AccountMemberNumber {
  memberNumber: number
}

export interface ResponseSuccess {
  success: true
}
