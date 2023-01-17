class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filters(){
        const quaryObject = {...this.queryString};
        //1A)Filtering
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete quaryObject[el]);
        // console.log(this.queryString, quaryObject);
        //2A)Advance Filtering
        let quaryStr = JSON.stringify(quaryObject);
        // console.log(JSON.stringify(quaryObject));
        quaryStr = quaryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        // console.log(JSON.parse(quaryStr));
        // let query = tour.find(JSON.parse(quaryStr));
        this.query = this.query.find(JSON.parse(quaryStr));

        return this;

    }

    sort(){
        if(this.queryString.sort){
            // console.log(this.queryString.sort);
            const sortby = this.queryString.sort.split(',').join(' ');
            // console.log(sortby);
            this.query = this.query.sort(sortby)
        }else{
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v')
        }
        return this;
    }

    paginate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page-1)*limit;
        // pages=3&limit=10, 1-10=page 1, 11-20=page 2, 21-30=page 3
        this.query = this.query.skip(skip).limit(limit);
        // if(this.queryString.page) {
        //     const count = await tour.countDocuments();
        //     if(skip >= count) throw Error('This page is not exit')
        // }
        return this;
    }
}

module.exports = APIFeatures;




// const tours = await tour.find().where('duration').equals(5).where('difficulty').equals('easy');
        //BUILD QUERY
        // const quaryObject = {...req.query};
        // //1A)Filtering
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete quaryObject[el]);
        // console.log(req.query, quaryObject);
        // //2A)Advance Filtering
        // let quaryStr = JSON.stringify(quaryObject);
        // // console.log(JSON.stringify(quaryObject));
        // quaryStr = quaryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        // console.log(JSON.parse(quaryStr));
        // let query = tour.find(JSON.parse(quaryStr));
        //gte, gt, lt, lte => $gte, $gt, #lt, #lte
        
        //2) Sorting
        // if(req.query.sort){
        //     const sortby = req.query.sort.split(',').join(' ');
        //     console.log(sortby);
        //     query = query.sort(sortby)
        // }
        // else{
        //     query = query.sort('-createdAt');
        // }

        //3) limiting
        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select('-__v')
        // }

        //Pagination
        // const page = req.query.page * 1 || 1;
        // const limit = req.query.limit * 1 || 100;
        // const skip = (page-1)*limit;
        // // pages=3&limit=10, 1-10=page 1, 11-20=page 2, 21-30=page 3
        // query = query.skip(skip).limit(limit);
        // if(req.query.page) {
        //     const count = await tour.countDocuments();
        //     if(skip >= count) throw Error('This page is not exit')
        // }