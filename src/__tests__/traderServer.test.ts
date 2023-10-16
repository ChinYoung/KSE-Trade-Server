import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { TradeServer } from "../server";
import { ERequestType, EResponseType } from "../types/trade";

describe("my awesome project", () => {
  let server: TradeServer, clientSocket: ClientSocket;

  beforeAll((done) => {
    server = new TradeServer();
    server.on<(input: string) => void>(ERequestType.INIT, ({ eventData: callback }) => {
      console.log('incoming')
      callback("hola");
    });
    server.on<(input: string) => void>(ERequestType.DELETE, ({ eventData: callback }) => {
      callback("bar");
    });
    server.start()
    clientSocket = ioc(`ws://localhost:888`);
    clientSocket.on("connect", done);
  });

  afterAll(() => {
    server.close();
    clientSocket.disconnect();
  });

  test("should work", (done) => {
    clientSocket.on(EResponseType.SYNC_TRADES, (arg: string) => {
      expect(arg).toBe("world");
      done();
    });
    server.emit({
      eventName: EResponseType.SYNC_TRADES,
      data: 'world'
    });
  });

  test("should work with an acknowledgement", (done) => {
    clientSocket.emit(ERequestType.INIT, (arg: string) => {
      expect(arg).toBe("hola");
      done();
    });
  });

  test("should work with emitWithAck()", async () => {
    const result = await clientSocket.emitWithAck(ERequestType.DELETE);
    expect(result).toBe("bar");
  });
});
