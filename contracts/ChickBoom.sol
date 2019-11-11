pragma solidity ^0.5.11;


contract ChickBoom {

    uint8 private STATE_NOT_ACTIVE = 0;
    uint8 private STATE_TICKET_SELLING = 1;

    address payable private _owner;
    uint256 private _ticket_price;
    uint32 private _tickets_count;
    uint32 private _sold_tickets;
    uint8 private _lottery_state = STATE_NOT_ACTIVE;

    address[] private _players;

    modifier only_owner() {
        require(msg.sender == _owner, "Access error");
        _;
    }

    constructor() public {
        _owner = msg.sender;
        _ticket_price = 500000000000000000;
        _tickets_count = 1000;
        _sold_tickets = 0;
        _players = new address[](_tickets_count);
    }

    function change_ticket_price(uint256 new_price) public only_owner {
        require(_lottery_state == STATE_NOT_ACTIVE, "Lottery already started");
        _ticket_price = new_price;
    }

    function change_tickets_count(uint32 new_count) public only_owner {
        require(_lottery_state == STATE_NOT_ACTIVE, "Lottery already started");
        _tickets_count = new_count;
        _sold_tickets = 0;
        _players = new address[](_tickets_count);
    }

    function start_lottery() public payable only_owner {
        require(_lottery_state == STATE_TICKET_SELLING, "Lottery not started");
        require(_sold_tickets > 0, "Not sold tickets");
        uint cush = _ticket_price * _sold_tickets;
        uint winner_id = (block.timestamp-1)%(_sold_tickets);
        address payable winner_addres = address(uint160(_players[winner_id]));
        winner_addres.transfer(cush);
        _lottery_state = STATE_NOT_ACTIVE;
        _sold_tickets = 0;
        _players = new address[](_tickets_count);
    }

    function reward() public only_owner {
        require(_lottery_state == STATE_TICKET_SELLING, "Lottery not started");
        for (uint32 i=0; i<_players.length; i++) {
            address payable participant_addres = address(uint160(_players[i]));
            participant_addres.transfer(_ticket_price);
        }
        _lottery_state = STATE_NOT_ACTIVE;
        _sold_tickets = 0;
    }

    function start_tickets_selling() public only_owner {
        _lottery_state = STATE_TICKET_SELLING;
    }

    function buy_ticket() public payable {
        require(_lottery_state == STATE_TICKET_SELLING, "Tickets not selling now");
        require(_sold_tickets < _tickets_count, "All tickets sell");
        require(msg.value >= _ticket_price, "Not enought amount");
        _players[0] = msg.sender;
        _sold_tickets = _sold_tickets+1;
    }

    function get_lottery_state() public view returns (uint8) {
        return _lottery_state;
    }

    function get_ticket_price() public view returns (uint256) {
        return _ticket_price;
    }

    function get_sold_tickets() public view returns (uint32) {
        return _sold_tickets;
    }

    function get_tickets_count() public view returns (uint32) {
        return _tickets_count;
    }

    function get_owner() public view returns (address) {
      return _owner;
    }
}
