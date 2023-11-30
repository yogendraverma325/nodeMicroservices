import mongoose, { ConnectOptions } from 'mongoose';

const mongooseLoader = async (): Promise<void> => {
  const options: ConnectOptions = {};
  //  `mongoose.set('strictQuery', true);` to suppress this warning.
  mongoose.set({ strictQuery: true });
  mongoose.connect(process.env.LOCAL_DB_URI as string, options);
  const connection = mongoose.connection;
  connection.once('open', (_) => {
    console.log('Database connected:', process.env.LOCAL_DB_URI);
  });

  connection.on('error', (err) => {
    console.error('connection error:', err);
  });
};

export default mongooseLoader;
