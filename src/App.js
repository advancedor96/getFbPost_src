/*global FB*/
import React, { Component } from 'react';
import {observer} from 'mobx-react';
import AppStore from './AppStore.js'
import Posts from './Posts.js'
import mobx from 'mobx';
import _ from 'lodash';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import moment from 'moment';

let numFetch = 0;

	function doFetch(next_url){
		if(AppStore.stop ===true){
			AppStore.setStatus('');
			console.log('停止');
			return;
		}
		numFetch++;
		console.log('●第', numFetch, '次呼叫doFetch...')

		fetch(next_url)
		.then(function(response) {
		 return response.json()
		}).then(function(json) {
			console.log('看到', json.data.length, '筆資料')

			for(let i = 0; i< json.data.length ;i++){

				if(AppStore.stop ===true){
					AppStore.setStatus('');
					console.log('停止');
					return;
				}

				if(json.data[i].hasOwnProperty('message')){
					let post = json.data[i]
					AppStore.addToPost_list(post);
				}else{
					AppStore.non_msg_list.push(json.data[i]);
					//console.log('沒有message的資料結構：', json.data[i])
				}
			}//for

			if(!json.paging){
				AppStore.setStatus('');
				console.log('沒有下一個fetch了，停止')
				console.log('程式結束，AppStore.post_list有', AppStore.post_list.length, '筆資料')

				console.log('無法處理的資料：', mobx.toJS(AppStore.non_msg_list))
				return;
				// break;
			}
			else{
				let n_url = json.paging.next;
				doFetch(n_url);
			}


		 	// console.log('parsed json', json)

		}).catch(function(ex) {
		 console.log('parsing failed', ex)
		})

	}

Date.prototype.Format = function (fmt) {  
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

class App extends Component {
	constructor(props){
		super(props);

		this.handleSubmit = this.handleSubmit.bind(this);
		this.getPosts = this.getPosts.bind(this);
		this.handleBeginDateChange = this.handleBeginDateChange.bind(this);
		this.handleEndDateChange = this.handleEndDateChange.bind(this);
		this.handleKeywordChange = this.handleKeywordChange.bind(this);
		this.handleStop = this.handleStop.bind(this);
	}




	handleStop(){
		AppStore.stop = true;

	}
	handleBeginDateChange(event, date){
		let moment_date = moment(date);
		AppStore.setBeginDate(moment_date)

		// let str = moment_date.format("YYYY-MM-DD")
	}



	handleEndDateChange(event, date){
		let moment_date = moment(date);
		AppStore.setEnd_date(moment_date)

		// let str = moment_date.format("YYYY-MM-DD")
		// console.log('end文字：', str);

	}

	handleKeywordChange(event){
		AppStore.setKeyword(event.target.value)
	}

	componentDidMount(){

		window.fbAsyncInit = function() {
			FB.init({
			  appId      : '1703462736637599',
			  xfbml      : true,
			  version    : 'v2.8'
			});

      FB.login(function(){
        console.log('登入成功');
      }, {scope: 'user_posts'});




		};

	    (function(d, s, id){
	     var js, fjs = d.getElementsByTagName(s)[0];
	     if (d.getElementById(id)) {return;}
	     js = d.createElement(s); js.id = id;
	     js.src = "//connect.facebook.net/en_US/sdk.js";
	     fjs.parentNode.insertBefore(js, fjs);
	    }(document, 'script', 'facebook-jssdk'));

	}



	handleSubmit(){
		AppStore.stop = false;


		numFetch = 0;
		AppStore.setPost_list([]);
		AppStore.setFilter_post_list([]);
		AppStore.setStatus('讀取資料...');


		let queryStr = `me/posts?limit=600`
		if(!_.isEmpty(AppStore.begin_date)){
			queryStr += `&since=${AppStore.begin_date}`;
		}
		if(!_.isEmpty(AppStore.end_date)){
			queryStr +=  `&until=${AppStore.end_date}`;
		}


      FB.getLoginStatus(function(res) {
        if (res.status === 'connected') {
          var accessToken = res.authResponse.accessToken;
          // this.setState({accessToken: accessToken});
          AppStore.setAccessToken(accessToken)
          // console.log('accessToken為：', accessToken);
          // getPosts();


          //&limit=300
          // `me/posts?until=${AppStore.end_date}&since=${AppStore.begin_date}&limit=600`
	      let url = queryStr;

	      console.log('讀取 FB url=', url);
	      // return ;
			FB.api(url, function(response) {


				console.log('抓到' , response.data.length , "筆資料");

				//第一次，用Fb.api抓到的資料們
				for(let i = 0; i< response.data.length ;i++){
					if(response.data[i].hasOwnProperty('message')){
						let post = response.data[i]
						AppStore.addToPost_list(post);
					}else{
						AppStore.non_msg_list.push(response.data[i]);
						//console.log('沒有message的資料結構：', response.data[i])
					}
				}//for


	        	if(response.paging){
	        		console.log('發現有下一頁')

        			let next_url = response.paging.next;
        			doFetch(next_url);


	        	}// if



	     	});//FB.api




        }else{
        	alert('尚未登入, 請允許彈跳視窗')
        	console.log('尚未正常登入')
			AppStore.setStatus('');
        }
      });



	}



	getPosts(){



	}

  render() {
    return (
	  <div>

      	<p style={{color:'blue'}}>取得你的Facebook 文章(請允許彈跳視窗以登入)</p>
      	<p>限制條件：(若無輸入，代表不限制)</p>
      	<p style={{color:'red'}}>{AppStore.status}</p>

    	<DatePicker 
			hintText="開始日期"
			autoOk={true}
      		value={AppStore.begin_date}
			onChange={this.handleBeginDateChange}
		/>  	


    	<DatePicker 
			hintText="結束日期"
			autoOk={true}
      		value={AppStore.end_date}
			onChange={this.handleEndDateChange}
		/> 

		<br />


		<br />

		<TextField
			floatingLabelText="包含字詞"
			hintText="ex: 2016-12-31"
			floatingLabelFixed={true}
      		value={AppStore.keyword}
      		onChange={this.handleKeywordChange}
		/>


		<br />

		<RaisedButton 
			label="列出文章" 
			primary={true}
			onClick={this.handleSubmit}
		/>
		<RaisedButton 
			label="停止" 
			secondary={true}
			onClick={this.handleStop}
		/>

      	<Posts />
      </div>
    );
  }
}

export default observer(App);


