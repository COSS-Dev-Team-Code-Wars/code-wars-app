import mongoose from 'mongoose';

const LeaderboardsSchema = new mongoose.Schema({
    rank: { type: Number, required: true },
    teamName: { type: String, required: true},
    score: { type: Number, required: true },
    totalScore: { type: Number, required: true }
});

const Leaderboards = mongoose.model("LeaderboardsSchema");

const retrieveLeaderboards = (req : any, res : any) => {
    Leaderboards.find({}, (err : any, leaderboards : any) => {
        if(!err) {   
            if(leaderboards != null) { // non-empty list
                leaderboards.sort({totalScore : 1});
                return res.send({ success: true, posts: leaderboards });
            } else { // empty list of leaderboards
                return res.send({ success: true, posts: leaderboards });
            }
        } else {
            console.log(err);
            return res.send({ success: false });
        }
    });
}




export { retrieveLeaderboards }