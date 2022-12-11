const blogModel = require('../models/blogModel.js');
const { isValidBody, isValidObjectId, isValidText } = require('../util/valitor.js');

//createBlog
const createBlog = async (req, res) => {
    try {   
        const reqBody = req.body
        let { title, body, authorId, category,isPublished } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please enter data.' })

        //Authorization
        if (authorId != req.user) return res.status(403).send({ status: false, message: 'You are unauthorized.' });

        if (!title) return res.status(400).send({ status: false, message: 'Please fill title.' })
        if (!body) return res.status(400).send({ status: false, message: 'Please fill body.' })
        if (!authorId) return res.status(400).send({ status: false, message: 'Please fill authorId.' })
        if (!category) return res.status(400).send({ status: false, message: 'Please fill cateegory.' })

        if (!isValidText(title)) return res.status(400).send({ status: false, message: 'Enter valid title.' });
        if (!isValidText(body)) return res.status(400).send({ status: false, message: 'Enter valid body.' });
        if (!isValidText(category)) return res.status(400).send({ status: false, message: 'Enter valid category.' });
        if (!isValidObjectId(authorId)) return res.status(400).send({ status: false, message: 'Enter valid authorId.' });

       if(isPublished == true)   reqBody.publishedAt = new Date()

        //blog creation
        const newBlog = await blogModel.create(reqBody);
        return res.status(201).send({ status: true, data: newBlog });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};

//getBlog
const getBlog = async (req, res) => {
    try {
        const reqBody = req.query;
        const { authorId, category, tags, subcategory } = reqBody;

        if (authorId)
            if (!isValidObjectId(authorId)) return res.status(400).send({ status: false, message: 'authorId is not valid.' })
        if (category)
            if (!isValidText(category)) return res.status(400).send({ status: false, message: 'Enter valid category.' })

        if ((Object.keys(reqBody).length === 0) || (authorId || category || tags || subcategory)) {

            const blog = await blogModel.find({ $and: [{ isDeleted: false, isPublished: true }, reqBody] });
            if (blog.length === 0) return res.status(404).send({ status: false, message: 'Blog not found.' });

            return res.status(200).send({ status: true, data: blog });
        } else return res.status(400).send({ status: false, message: 'Invalid query.' });

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message });
    }
};

//updateBlog
const updateBlog = async (req, res) => {
    try {
        const reqBody = req.body;
        const blogId = req.params.blogId
        const { title, body, tags, subcategory, isPublished } = reqBody;

        if (!isValidBody(reqBody)) return res.status(400).send({ status: false, message: 'Please enter data for updation.' })
        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, message: 'BlogId is not valid.' });

        const blog = await blogModel.findById(blogId);
        if (!blog) return res.status(400).send({ status: false, message: 'Blog does not exists.' });

        //uthorization
        if (req.user != blog.authorId) return res.status(403).send({ status: false, message: 'You are unauthorized.' });

        if (blog.isDeleted === true) return res.status(404).send({ status: false, message: 'Blog not found' });

        //updating blog
        const updatedBlog = await blogModel.findByIdAndUpdate({ _id: blogId }, { $addToSet: { tags, subcategory }, $set: { title, body, publishedAt: new Date(), isPublished: isPublished } }, { new: true });

        return res.status(200).send({ status: true, data: updatedBlog });
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
};

//deleteBlog
const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        if (!isValidObjectId(blogId)) return res.status(400).send({ status: false, message: 'BlogId is not valid.' })

        const blog = await blogModel.findById(blogId)
        if (!blog) return res.status(400).send({ status: false, message: 'Blog does not exists.' });

        //uthorization
        if (req.user != blog.authorId) return res.status(403).send({ status: false, message: 'You are unauthorized.' });
        if (blog.isDeleted === true) return res.status(404).send({ status: false, message: `'${blog.title}' blog already deleted.` });

        //deleting
        await blogModel.findByIdAndUpdate({ _id: blogId }, { $set: { isDeleted: true, isPublished: false, deletedAt: new Date() } }, { new: true });

        return res.status(200).send({ status: true, message: `'${blog.title}' blog deleted sucessfully.` })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }
};


const deletedByQuery = async (req, res) => {
    try {
        const reqQuery = req.query;
        const { authorId, category, tags, subcategory, isPublished } = reqQuery;

        if (authorId || category || tags || subcategory || isPublished) {
            // finding blog by query 
            const foundBlog = await blogModel.find({ $and: [ { isDeleted: false }, reqQuery] }); //[{blog1},{blog2},{blog3}]  
            if (foundBlog.length === 0) return res.status(404).send({ status: false, message: 'blog not found.' });
            for (let i = 0; i < foundBlog.length; i++) {
                if (req.user == foundBlog[i].authorId) {
                    const allBlog = await blogModel.updateMany(
                        { $and: [{ authorId: req.user }, reqQuery] },
                        { $set: { isDeleted: true, isPublished: false, deletedAt: Date.now() } }
                    );

                    // sending response
                    if (allBlog.modifiedCount === 0) return res.status(400).send({ status: false, message: 'No blog to be deleted.' });
                    else return res.status(200).send({ status: true, data: `${allBlog.modifiedCount} blog deleted` });
                } 
            }
             return res.status(403).send({ status: false, message: 'you are unauthorized.' });

        } else return res.status(400).send({ status: false, message: 'Invalid query.' });

    } catch (err) {
        console.log(err);
        return res.status(500).send({ status: false, message: err.message });
    }
};
module.exports = { createBlog, getBlog, updateBlog, deleteBlog, deletedByQuery }
