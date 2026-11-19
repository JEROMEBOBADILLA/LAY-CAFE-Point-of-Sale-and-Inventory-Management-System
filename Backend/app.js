import express from 'express';
import cors from 'cors';
import inventoryRoutes from './routes/inventoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import saleRoutes from './routes/saleRoutes.js';

let corsOptions = {
    origin: 'http://localhost:5173',
};
//create express app
const app = express();

//to parse incoming data
app.use(express.json());
app.use(cors(corsOptions));


app.use('/inventory', inventoryRoutes);
app.use('/products', productRoutes);
app.use('/sales', saleRoutes);


try {
    const port = 3000;
    app.listen(port, () => {
        console.log(`listening to port ${port}...`);
    });
}  catch(e) {
    console.log(e)
}
