// export default (req, res, next) => {
//     if (!res.appData) next()
//     const { code, data } = res.appData
//     delete res.appData
//     return res.status(code).jsend.success(data)
//   }

module.exports = (req, res, next) => {
    if (!res.appData) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }

    const { data, code = 200 } = res.appData;
    return res.status(code).json({
        success: code < 400,
        ...data
    });
};