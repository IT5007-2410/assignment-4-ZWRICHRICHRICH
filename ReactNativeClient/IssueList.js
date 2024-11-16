import React, {useState} from 'react';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import { Picker } from '@react-native-picker/picker';

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    Button,
    useColorScheme,
    View,
    TouchableOpacity,
  } from 'react-native';

  const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

  function jsonDateReviver(key, value) {
    if (typeof value === 'string' && dateRegex.test(value)) {
      const dateValue = new Date(value);
      return isNaN(dateValue) ? value : dateValue;
    }
    return value;
  }

  async function graphQLFetch(query, variables = {}) {
    try {
        /****** Q4: Start Coding here. State the correct IP/port******/
        const response = await fetch('http://10.0.2.2:3000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ query, variables })
        /****** Q4: Code Ends here******/
      });
      const body = await response.text();
      const result = JSON.parse(body, jsonDateReviver);
      console.log('GraphQL Response:', result); // 打印后端返回的完整响应

      if (result.errors) {
        const error = result.errors[0];
        const details = error?.extensions?.exception?.errors?.join('\n ') || 'Unknown error details';
        alert(`Error: ${error?.message || 'Unknown error'}\nDetails: ${details}`);
        return null;
      }

      return result.data || null;
    } catch (e) {
      alert(`Network Error: ${e.message}`);
      console.error(e);
      return null;
    }
  }

class IssueFilter extends React.Component {
    render() {
      return (
        <>
        {/****** Q1: Start Coding here. ******/}
        <TextInput
            placeholder="Filter by title"
            style={styles.input}
            onChangeText={(text) => {
                this.props.onFilterChange({ title: text });  
            }}
        />
        {/****** Q1: Code ends here ******/}
        </>
      );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  header: { height: 50, backgroundColor: '#537791' },
  text: { textAlign: 'center' },
  dataWrapper: { marginTop: -1 },
  row: { height: 40, backgroundColor: '#E7E6E1' },

  // Additions in CSS
  topHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#333' },  // Larger header with color
  subHeader: { fontWeight: 'bold', marginBottom: 15, fontSize: 16 },  // Subheader with different margin and font size
  horizontalLine: { borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 15 }, // More spacing for horizontal line

  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-evenly', // 均匀分布按钮
    marginBottom: 20 
  },
  button: { 
    flex: 1, // 每个按钮占据相等的宽度
    paddingVertical: 12, 
    marginHorizontal: 5, // 按钮间增加水平间距
    backgroundColor: '#28a745', 
    borderRadius: 8, 
    alignItems: 'center' // 确保文字居中
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },

  formLabel: { marginRight: 12, fontWeight: 'bold', fontSize: 14, width: 60 }, // Adjusted label size for form
  formRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, // Increased margin to separate form rows
  picker: { width: 180, backgroundColor: '#f8f8f8', borderRadius: 5 }, // Styled picker
  pickerItem: { fontSize: 16, paddingVertical: 8 }, // Styled picker items
  });

const width= [40,60,60,60,80,80,200];

function IssueRow(props) {
  const issue = props.issue;

  {/****** Q2: Coding Starts here. Create a row of data in a variable******/}
  const rowData = [
    issue.id || 'N/A',
    issue.title || 'No Title',
    issue.status || 'No Status',
    issue.owner || 'Unassigned',
    issue.created ? new Date(issue.created).toLocaleString() : 'No Date',
    issue.effort || '0',
    issue.due ? new Date(issue.due).toLocaleString() : 'No Due Date',
  ];
  {/****** Q2: Coding Ends here.******/}

  return (
    <>
    {/****** Q2: Start Coding here. Add Logic to render a row ******/}
      <Row data={rowData} style={styles.row} textStyle={styles.text} widthArr={width} />
    {/****** Q2: Coding Ends here.******/}
    </>
  );
}

function IssueTable(props) {
  {/****** Q2: Coding Starts here. Map issues to rows******/}
  const issueRows = props.issues.map(issue =>
    <IssueRow key={issue.id} issue={issue} />
  );
  {/****** Q2: Coding Ends here.******/}

  {/****** Q2: Start Coding here. Add Logic to initialize table header ******/}
  const tableHeader = ['ID', 'Title', 'Status', 'Owner', 'Created', 'Effort', 'Due'];
  {/****** Q2: Coding Ends here.******/}

  return (
    <>
      {/****** Q2: Start Coding here. Add table title and scrolling logic ******/}
      <Text style={styles.subHeader}>Issue Table</Text>
      <IssueFilter
        onFilterChange={(filter) => {
          let originIssues = props.originIssues;
          if (!originIssues || props.issues.length > originIssues.length) {
            originIssues = props.issues;
          }
          const filteredIssues = originIssues.filter(
            (issue) => (!filter.title || issue.title.includes(filter.title))
          );
          props.onUpdateIssues(filteredIssues, originIssues);
        }}
      />
      <ScrollView horizontal={true}> 
        <View style={[styles.container, { minWidth: 1000 }]}> {/* 设置宽度 */}
          <Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }}>
            <Row 
              data={tableHeader} 
              style={styles.header} 
              textStyle={styles.text} 
              widthArr={width} // 为每列设置固定宽度
            />
            <ScrollView style={styles.dataWrapper}>
              {issueRows}
            </ScrollView>
          </Table>
        </View>
      </ScrollView>
      {/****** Q2: Coding Ends here.******/}
    </>
  );
}


  
class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    /****** Q3: Start Coding here. Create State to hold inputs******/
    this.state = {
      title: '',
      status: 'New',
      owner: '',
      effort: '',
      due: '',
    };
    /****** Q3: Code Ends here. ******/
  }

  /****** Q3: Start Coding here. Add functions to hold/set state input based on changes in TextInput******/
  handleChange = (field, value) => {
    this.setState({ [field]: value });
  };
  /****** Q3: Code Ends here. ******/
  
  validateInputs = () => {
    const { title, status, due } = this.state;

    if (!title.trim()) {
      alert('Title is required.');
      return false;
    }
    if (!status.trim()) {
      alert('Status is required.');
      return false;
    }
    if (due && isNaN(Date.parse(due))) {
      alert('Invalid due date. Please use YYYY-MM-DD format.');
      return false;
    }

    return true;
  };

  handleSubmit() {
    /****** Q3: Start Coding here. Create an issue from state variables and call createIssue. Also, clear input field in front-end******/
    if (!this.validateInputs()) return;

    const { title, status, owner, effort, due } = this.state;
    const issue = {
      title,
      status,
      owner,
      effort: isNaN(parseInt(effort, 10)) ? null : parseInt(effort, 10),
      due: due ? new Date(due).toISOString() : null, // 确保 due 是 ISO 格式字符串
    };
    console.log('Submitting issue:', issue); // 调试信息
    this.props.onAddIssue(issue);
    this.setState({ title: '', status: 'New', owner: '', effort: '', due: '' }); // Clear form
    /****** Q3: Code Ends here. ******/
  }

  render() {
    return (
        <View style={styles.formContainer}>
        {/****** Q3: Start Coding here. Create TextInput field, populate state variables. Create a submit button, and on submit, trigger handleSubmit.*******/}
        <Text style={styles.formTitle}>Add New Issue</Text>
        <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput
                placeholder="Enter title"
                value={this.state.title}
                onChangeText={(value) => this.handleChange('title', value)}
            />
        </View>
        <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Owner</Text>
            <TextInput
                placeholder="Enter owner"
                value={this.state.owner}
                onChangeText={(value) => this.handleChange('owner', value)}
            />
        </View>
        <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Effort</Text>
            <TextInput
                placeholder="Enter effort"
                keyboardType="numeric"
                value={this.state.effort}
                onChangeText={(value) => this.handleChange('effort', value)}
            />
        </View>
        <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Due Date</Text>
            <TextInput
                placeholder="YYYY-MM-DD"
                value={this.state.due}
                onChangeText={(value) => this.handleChange('due', value)}
            />
        </View>
        <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Status</Text>
            <Picker
                selectedValue={this.state.status || 'New'}
                onValueChange={(value) => this.handleChange('status', value)}
                style={styles.picker}
            >
                <Picker.Item label="New" value="New" />
                <Picker.Item label="Assigned" value="Assigned" />
                <Picker.Item label="Fixed" value="Fixed" />
                <Picker.Item label="Closed" value="Closed" />
            </Picker>
        </View>
        <Button title="Add Issue" color="#28a745" onPress={this.handleSubmit} />
        {/****** Q3: Code Ends here. ******/}
        </View>
    );
  }
}


class BlackList extends React.Component {
    constructor()
    {   super();
        this.handleSubmit = this.handleSubmit.bind(this);
        /****** Q4: Start Coding here. Create State to hold inputs******/
        this.state = { nameInput: '' };
        /****** Q4: Code Ends here. ******/
    }
    /****** Q4: Start Coding here. Add functions to hold/set state input based on changes in TextInput******/
    handleChange = (value) => {
      this.setState({ nameInput: value });
    };
    /****** Q4: Code Ends here. ******/

    async handleSubmit() {
    /****** Q4: Start Coding here. Create an issue from state variables and issue a query. Also, clear input field in front-end******/
    const { nameInput } = this.state;
    const query = `mutation addToBlacklist($nameInput: String!) {
        addToBlacklist(nameInput: $nameInput)
    }`;

    const data = await graphQLFetch(query, { nameInput });
    if (data) {
        alert('Name added to blacklist');
    }
    this.setState({ nameInput: '' }); // Clear input
    /****** Q4: Code Ends here. ******/
    }

    render() {
    return (
        <View>
        {/****** Q4: Start Coding here. Create TextInput field, populate state variables. Create a submit button, and on submit, trigger handleSubmit.*******/}
        <TextInput
                    placeholder="Enter name"
                    value={this.state.nameInput}
                    onChangeText={this.handleChange}
        />
        <Button title="Add to Blacklist" onPress={this.handleSubmit} />
        {/****** Q4: Code Ends here. ******/}
        </View>
    );
    }
}

export default class IssueList extends React.Component {
  constructor() {
      super();
      this.state = { issues: [], display: 1 }; // 添加 display 状态用于切换显示的组件
      this.createIssue = this.createIssue.bind(this);
      this.setDisplay = this.setDisplay.bind(this);
  }

  setDisplay(value) {
      this.setState({ display: value }); // 切换当前显示的组件
  }

  componentDidMount() {
      this.loadData();
  }

  async loadData() {
      /****** Q1: Start Coding here. Create GraphQL query to load issue list ******/
      const query = `query {
          issueList {
              id title status owner
              created effort due
          }
      }`;
      /****** Q1: Code Ends here. ******/

      const data = await graphQLFetch(query);
      if (data) {
          this.setState({ issues: data.issueList });
      }
  }

  async createIssue(issue) {
      /****** Q3: Start Coding here. Create GraphQL mutation to add issue ******/
      console.log('Adding issue:', issue); // 打印发送的 issue 内容

      const query = `mutation issueAdd($issue: IssueInputs!) {
          issueAdd(issue: $issue) {
              id
          }
      }`;
      console.log("Submitting issue:", issue); // 检查数据格式
      /****** Q3: Code Ends here. ******/

      const data = await graphQLFetch(query, { issue });
      console.log('GraphQL Response:', data); // 打印完整的响应
      if (data) {
          this.loadData(); // 数据更新后重新加载列表
      } else {
        alert('Failed to add issue. Please check the input or try again.');
      }
  }

  render() {
      return (
          <>
              {/* top header */}
              <Text style={styles.topHeader}>Issue Tracker</Text>
              
              {/* navigation button */}
              <View style={styles.buttonRow}>
                  {/****** Q1: Start Coding here. Add buttons for navigation ******/}
                  <TouchableOpacity onPress={() => this.setDisplay(2)} style={styles.button}>
                  <Text style={styles.buttonText}>Issue Table</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.setDisplay(3)} style={styles.button}>
                  <Text style={styles.buttonText}>Issue Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.setDisplay(4)} style={styles.button}>
                  <Text style={styles.buttonText}>Blacklist</Text>
                  </TouchableOpacity>
                  {/****** Q1: Code Ends here. ******/}
              </View>

              {/****** Q1: Start Coding here. Add logic to render IssueFilter and IssueTable */}
              {this.state.display === 2 && (
                <IssueTable
                  issues={this.state.issues}
                  originIssues={this.state.originIssues}
                  onUpdateIssues={(filteredIssues, originIssues) => {
                    this.setState({ issues: filteredIssues, originIssues });
                  }}
                />
              )}
              {/****** Q1: Code Ends here ******/}

              {/****** Q2: Start Coding here. Add logic to render IssueTable ******/
              /* 显示问题列表 */}
              
              {/* integrated in Q1 code above */}
              
              {/****** Q2: Code Ends here ******/}

              {/****** Q3: Start Coding here. Add logic to render IssueAdd ******/
              /* 添加问题的表单 */}
              {this.state.display === 3 && <IssueAdd onAddIssue={this.createIssue} />}
              {/****** Q3: Code Ends here ******/}

              {/****** Q4: Start Coding here. Add logic to render BlackList ******/
              /* show black list */}
              {this.state.display === 4 && <BlackList />}
              {/****** Q4: Code Ends here ******/}
          </>
      );
  }
}



