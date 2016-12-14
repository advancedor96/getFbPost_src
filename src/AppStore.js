
import {observable, action} from 'mobx';
import _ from 'lodash'

let AppStore = observable({
	begin_date : "",
	end_date: "",
	accessToken: '',
	post_list: [],
	filter_post_list: [],
	non_msg_list: [],
	keyword: '',
	status: '',
	stop:false
});

_.assign(AppStore, {
	setBeginDate: action(function(val){
		this.begin_date = val;
	}),

	setEnd_date: action(function(val){
		this.end_date = val;
	}),

	setAccessToken: action(function(val){
		this.accessToken = val;
	}),

	setPost_list: action(function(val){
		this.post_list = val;
	}),

	addToPost_list: action(function(val){
		this.post_list.push(val);
		this.filter_post_list = _.filter(this.post_list, (o)=>{
			let i = o.message.indexOf(this.keyword);
			if(i!==-1){
				// console.log('有符合')
				return true;
			}else{
				// console.log('沒符合')
				return false;
			}
		})
	}),

	setFilter_post_list: action(function(val){
		this.filter_post_list = val;
	}),

	setNon_msg_list: action(function(val){
		this.non_msg_list = val;
	}),

	setKeyword: action(function(val){
		this.keyword = val;
	}),

	setStatus: action(function(val){
		this.status = val;
	})
})

export default AppStore;

