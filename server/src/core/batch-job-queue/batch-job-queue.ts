import { EventEmitter } from 'events';

export interface BatchJobQueueOpts {
  batchSize: number;
}

export interface BatchJobQueueHandler<T> {
  (data: T): Promise<any>;
}

/**
 * Implements a job queue than executes jobs in batches of a configurable batch size.
 * Jobs are represented as data items that are pushed to the queue. Each item will
 * be processed by a handler that is provided to the constructor. A `done` event is emitted
 * when all items have been processed.
 *
 * The queue has the following properties:
 * - Data items the same batch are processed concurrently.
 * - All data items in one batch are completed before the next batch can be processed
 * - Data items are not processed until there are enough data to fill a batch (unless eof has been reached)
 * - It is the responsibility of the caller to indicate that no more input is available by calling the `signalEof()` method
 * - The `done` event is emitted when all the data has been processed **and** end of input has been reached.
 * - The queue guarantees that batches are processed in order, but it does guarantee the order within a single batch.
 *  If you want all data items to be completed based insertion order, then set a batch size of 1.
 */
export class BatchJobQueue<T> extends EventEmitter {
  eof = false;
  busy = false;
  buffer: T[];
  batchSize: number;
  handler: BatchJobQueueHandler<T>;

  /**
   * @param handler asynchronous function used to process items in the queue.
   * @param opts options
   */
  constructor (handler: BatchJobQueueHandler<T>, opts: BatchJobQueueOpts = { batchSize: 5 }) {
    super();
    this.buffer = [];
    this.batchSize = opts.batchSize;
    this.handler = handler;
  }

  /**
   * indicates that no more input is available.
   * The queue expects a finite stream of input, therefore this method **must be called**
   * to ensure that all data are processed and that the `done` event is emitted.
   * * Attempting to `push` new items after calling `signalEof()` will result in an error.
   */
  signalEof () {
    this.eof = true;
    this.processNextBatch();
  }

  /**
   * adds a new item to the queue. The queue will automatically
   * start processing data when it has enough items to fill a batch.
   * @param data
   */
  push (data: T) {
    if (this.eof) {
      throw new Error('Cannot add data to queue after eof has been signaled');
    }
    this.buffer.push(data);
    if (this.hasEnoughData) {
      this.processNextBatch();
    }
  }

  takeNextBatch () {
    const batch = this.buffer.splice(0, this.batchSize);
    return batch;
  }

  processNextBatch () {
    if (this.busy) {
        return;
    }
    this.busy = true;
    process.nextTick(async () => {
      const batch = this.takeNextBatch();
      await Promise.all(batch.map(this.handler));
      this.busy = false;
      if (this.isEmpty && this.eof) {
        this.emit('done');
        return;
      }
      if (this.hasEnoughData || this.eof) {
        this.processNextBatch();
      }
    });
  }

  get isEmpty () {
    return !this.buffer.length;
  }

  get hasEnoughData () {
    return this.buffer.length >= this.batchSize;
  }
}
