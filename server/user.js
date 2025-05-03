class User{

    constructor(nickname, password, email){
        this.nickname = nickname;
        this.balance = 100;
        this.matches_won = 0;
        this.matches_played = 0;
        this.password = password;
        this.email = email;
        this.cards = [];
    };

    static validatePassword(password, bcrypt) {
        return bcrypt.compareSync(password, this.password);
    }

    get username(){
        return this.username;
    };
}

module.exports = User;

