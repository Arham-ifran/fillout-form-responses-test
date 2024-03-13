import axios from 'axios';
import { getFilloutFormResponsesUrl, defaultLimit, defaultOffset, defaultStatus, defaultSort, demoFormId, demoFormAuth } from '../../config/config.mjs';
import Response from '../models/response.model.mjs';

// API to fetch the filtered reponses from a Fillout form
export const getResponses = async (req, res) => {
    try {
        const { query } = req;
        const { statusCode = 200, ...result } = await filterFormResponses(query);
        return res.status(statusCode).send({ ...result });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
};

// method to filter the responses from the mirrored data
const filterFormResponses = async (query) => {
    try {
        const { limit = defaultLimit, afterDate, beforeDate, offset = defaultOffset, status = defaultStatus, includeEditLink, sort = defaultSort, filters } = query;

        // dynamic aggregation pipeline filter
        const queryData = {};

        if (afterDate && beforeDate) {
            queryData['$and'] = [
                { submissionTime: { $gt: new Date(afterDate) } },
                { submissionTime: { $lt: new Date(beforeDate) } }
            ]
        } else {
            if (afterDate)
                queryData.submissionTime = { $gt: new Date(afterDate) };

            if (beforeDate)
                queryData.submissionTime = { $lt: new Date(beforeDate) };
        }

        if (status)
            queryData.status = status;

        if (filters) {
            queryData['$expr'] = {
                $and: [
                    {
                        $allElementsTrue: {
                            $map: {
                                input: filters,
                                as: 'filter',
                                in: await getFilterPipeline()
                            }
                        }
                    },
                    {
                        $not: {
                            $in: [null, { $ifNull: ['$questions.value', null] }]
                        }
                    }
                ]
            }
        }

        const totalResponses = await Response.countDocuments(queryData);
        const pageCount = Math.ceil(totalResponses / limit);

        // filter responses and apply pagination
        const responses = await Response.aggregate([
            { $match: queryData }, // filtering the data w.r.t. afterDate, beforeDate, status, or filters if provided in query params
            { $sort: { submissionTime: sort === defaultSort ? 1 : -1 } }, // sorting data w.r.t. submission time
            { $skip: offset },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    submissionId: 1,
                    submissionTime: 1,
                    questions: 1,
                    editLink: Number(includeEditLink)
                }
            }
        ]);

        return {
            responses,
            totalResponses,
            pageCount
        };
    } catch (error) {
        return {
            statusCode: 400,
            message: error.message // error while fetching form responses from DB
        }
    }
};

// method returns the aggregate pipeline for filters 
const getFilterPipeline = () => {
    return {
        $switch: {
            branches: [
                {
                    case: { $eq: ['$$filter.condition', 'equals'] },
                    then: {
                        $in: [
                            '$$filter.value',
                            {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: '$questions',
                                            as: 'question',
                                            cond: { $eq: ['$$question.id', '$$filter.id'] }
                                        }
                                    },
                                    as: 'question',
                                    in: '$$question.value'
                                }
                            }
                        ]
                    }
                },
                {
                    case: { $eq: ['$$filter.condition', 'does_not_equal'] },
                    then: {
                        $not: {
                            $anyElementTrue: {
                                $map: {
                                    input: '$questions',
                                    as: 'question',
                                    in: {
                                        $and: [
                                            { $eq: ['$$question.id', '$$filter.id'] },
                                            { $eq: ['$$question.value', '$$filter.value'] }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    case: { $eq: ['$$filter.condition', 'greater_than'] },
                    then: {
                        $gt: [
                            {
                                $max: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: '$questions',
                                                as: 'question',
                                                cond: { $eq: ['$$question.id', '$$filter.id'] }
                                            }
                                        },
                                        as: 'question',
                                        in: '$$question.value'
                                    }
                                }
                            },
                            '$$filter.value'
                        ]
                    }
                },
                {
                    case: { $eq: ['$$filter.condition', 'less_than'] },
                    then: {
                        $lt: [
                            {
                                $min: {
                                    $map: {
                                        input: {
                                            $filter: {
                                                input: '$questions',
                                                as: 'question',
                                                cond: { $eq: ['$$question.id', '$$filter.id'] }
                                            }
                                        },
                                        as: 'question',
                                        in: '$$question.value'
                                    }
                                }
                            },
                            '$$filter.value'
                        ]
                    }
                }
            ],
            default: false
        }
    }
};

// this method gets Fillout demo form responses and sets them in this server DB, for this assignment this will work up to 150 responses only
export const demoFormSeed = async () => {
    try {
        // get Fillout form responses
        const { responses = [] } = await getFilloutFormResponses(demoFormId, demoFormAuth);

        // delete any pre-existing data
        await Response.deleteMany({});

        // save retrieved Fillout form reponses in DB
        await Response.insertMany(responses);
    } catch (error) {
        return {
            statusCode: 400,
            message: error.message // error while running seed for demo form responses
        }
    }
};

// method to get form responses for the given form
const getFilloutFormResponses = async (formId, formAuth) => {
    try {
        // Fillout form API (base) url
        const endpoint = await getFilloutFormResponsesUrl(formId)

        // defining API request headers for Fillout form
        const headers = {
            'Authorization': formAuth
        };

        // include edit link only when this filter is applied
        const params = {
            includeEditLink: true
        }

        // Fillout form API request configurations
        const config = {
            headers,
            params
        };

        const response = await axios.get(endpoint, config)
        const { data } = response;
        return data;
    } catch (error) {
        return {
            statusCode: 400,
            message: error.message // error while fetching Fillout form responses for given formId
        }
    }
};