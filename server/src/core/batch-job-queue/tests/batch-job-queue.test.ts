import { BatchJobQueue, BatchJobQueueHandler, BatchJobQueueOpts } from '../batch-job-queue';

describe('BatchJobQueue', () => {
  let queue: BatchJobQueue<any>;
  let opts: BatchJobQueueOpts;
  let handler: BatchJobQueueHandler<any>;

  beforeEach(() => {
    opts = { batchSize: 2 };
    handler = jest.fn().mockImplementation(() => Promise.resolve());
    const _handler = (x: any) => handler(x);
    queue = new BatchJobQueue(_handler, opts);
  });

  test('should queue pushed tasks, run them and emit done event when done', (done) => {
    queue.on('done', () => {
      expect(handler).toHaveBeenCalledWith(1);
      expect(handler).toHaveBeenCalledWith(2);
      expect(handler).toHaveBeenCalledWith(3);
      done();
    });
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.signalEof();
  });

  test('should return promise that is resolved after completion when run is called', async () => {
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.push(4);
    queue.push(5);
    queue.push(6);
    queue.signalEof();
    await queue.run();
    expect(handler).toHaveBeenCalledWith(1);
    expect(handler).toHaveBeenCalledWith(2);
    expect(handler).toHaveBeenCalledWith(3);
    expect(handler).toHaveBeenCalledWith(4);
    expect(handler).toHaveBeenCalledWith(5);
    expect(handler).toHaveBeenCalledWith(6);
  });

  test('should not run new jobs until it has enough tasks in queue (as determined by batchSize)', (done) => {
    queue.push(1);
    process.nextTick(() => {
      expect(handler).not.toHaveBeenCalled();
      queue.push(2);
      process.nextTick(() => {
        expect(handler).toHaveBeenCalledWith(1);
        expect(handler).toHaveBeenCalledWith(2);
        queue.signalEof();
      });
    });
    queue.on('done', done);
  });

  test('after running a batch, it should not run remaining jobs if they do not fill a batch', (done) => {
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.on('done', done);

    process.nextTick(() => {
      expect(handler).toHaveBeenCalledWith(1);
      expect(handler).toHaveBeenCalledWith(2);
      expect(handler).not.toHaveBeenCalledWith(3);

      queue.push(4);
      process.nextTick(() => {
        expect(handler).toHaveBeenCalledWith(1);
        expect(handler).toHaveBeenCalledWith(2);
        queue.signalEof();
      });
    });
  });

  test('should not execute a new batch while there is a batch currently being processed', (done) => {
    const resolvers: Function[] = [];
    const spy = jest.fn();
    handler = (x) => {
      spy(x);
      return new Promise((resolve) => {
        // defer completion of tasks
        resolvers.push(resolve);
      });
    };
    queue = new BatchJobQueue<any>(handler, { batchSize: 2 });
    queue.push(1);
    queue.push(2);
    queue.push(3);
    queue.push(4);
    queue.signalEof();
    queue.on('done', done);
    setTimeout(() => {
      expect(spy).toHaveBeenCalledWith(1);
      expect(spy).toHaveBeenCalledWith(2);
      expect(spy).not.toHaveBeenCalledWith(3);
      expect(spy).not.toHaveBeenCalledWith(4);
      expect(resolvers.length).toBe(2);
      // complete the first 2 tasks
      resolvers.forEach(resolve => resolve());
      resolvers.splice(0);
      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(3);
        expect(spy).toHaveBeenCalledWith(4);
        expect(resolvers.length).toBe(2);
        resolvers.forEach(resolve => resolve());
      }, 0);
    }, 0);
  });

  test('when end of input is signaled, it should run remaining tasks even if they do not fill a batch', (done) => {
    queue.push(1);
    process.nextTick(() => {
      expect(handler).not.toHaveBeenCalledWith(1);
      queue.on('done', () => {
        expect(handler).toHaveBeenCalledWith(1);
        done();
      });
      queue.signalEof();
    });
  });

  test('pushing new tasks after eof should throw an error', (done) => {
    queue.push(1);
    queue.signalEof();
    expect(() => queue.push(2)).toThrow(/cannot add data/i);
    queue.on('done', done);
  });

  test('all tasks in one batch should be completed before all tasks in a later batch', (done) => {
    const results: any[] = [];
    const batches = [[1, 2, 3], [4, 5, 6], [7]];
    handler = (x) => {
      return new Promise((resolve) => {
        // simulate tasks taking different amount of times to complete
        setTimeout(() => {
          results.push(x);
          resolve();
        }, Math.floor(Math.random() * 10));
      });
    };

    queue = new BatchJobQueue(handler, { batchSize: 3 });
    batches.forEach((batch) => batch.forEach(item => queue.push(item)));
    queue.signalEof();

    queue.on('done', () => {
      expect(results.length).toBe(7);
      for (let i = 0; i < batches.length - 1; i++) {
        const batch = batches[i];
        const nextBatch = batches[i + 1];
        batch.forEach((item) => {
          nextBatch.forEach((itemInNextBatch) => {
            expect(results.indexOf(item) < results.indexOf(itemInNextBatch));
          });
        });
      }
      done();
    });
  });
});
