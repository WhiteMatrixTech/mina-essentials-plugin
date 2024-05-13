import {
  AccountUpdate,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  fetchAccount,
} from "o1js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

interface VerificationKeyData {
  data: string;
  hash: Field;
}

const state = {
  Contract: null as null | any,
  zkapp: null as null | any,
  transaction: null as null | Transaction,
  verificationKey: null as null | VerificationKeyData, //| VerificationKeyData;
};

// ---- -----------------------------------------------------------------------------------

export async function findSmartContracts(paths: string[]) {
  console.log(paths)
}

function timeout(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

const functions = {
  setActiveInstanceToBerkeley: async (args: { gqlUrl: string }) => {
    console.log("Creating Zk Instance");
    // const Berkeley = Mina.Network(args.gqlUrl + "/graphql");
    // Mina.setActiveInstance(Berkeley);
  },

  loadContract: async (args: { contract: string, moduleName: string }) => {
    const blob = new Blob([args.contract], {
      type: 'text/javascript'
    });
    const url = URL.createObjectURL(blob);

    const module = await import(/* webpackIgnore: true */ url);
    const ins = Mina.Network('https://api.minascan.io/node/devnet/v1' + "/graphql");
    Mina.setActiveInstance(ins);
    module['setMinaIns'](ins)
    state.Contract = module[args.moduleName];
  },

  compileContract: async (args: {}) => {
    const { verificationKey } = await state.Contract!.compile();
    console.log(verificationKey, 111)
    state.verificationKey = verificationKey;
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },

  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    state.zkapp = new state.Contract!(publicKey);
    console.log(state.zkapp, state.Contract!._methods, 1111);
  },

  getNum: async (args: {}) => {
    const currentNum = await state.zkapp!.num.get();
    return JSON.stringify(currentNum.toJSON());
  },

  createUpdateTransaction: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
      return state.zkapp!.update();
    });
    state.transaction = transaction;
  },

  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },

  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  },

  createDeployTransaction: async (args: {
    feePayer: string;
    privateKey58: string;
  }) => {
    if (state === null) {
      throw Error("state is null");
    }
    const zkAppPrivateKey: PrivateKey = PrivateKey.fromBase58(
      args.privateKey58
    );
    const feePayerPublickKey = PublicKey.fromBase58(args.feePayer);
    const transaction = await Mina.transaction(feePayerPublickKey, () => {
      AccountUpdate.fundNewAccount(feePayerPublickKey);
      return state.zkapp!.deploy({
        zkappKey: zkAppPrivateKey,
        verificationKey: state.verificationKey as VerificationKeyData,
      });
    });
    transaction.sign([zkAppPrivateKey]);
    state.transaction = transaction;
  },
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

addEventListener(
  "message",
  async (event: MessageEvent<ZkappWorkerRequest>) => {
    const returnData = await functions[event.data.fn](event.data.args);
    console.log(event.data, 1111);
    const message: ZkappWorkerReponse = {
      id: event.data.id,
      data: returnData,
    };
    postMessage(message);
  }
);