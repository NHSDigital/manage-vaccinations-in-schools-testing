/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 83.07267709291628, "KoPercent": 16.927322907083717};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4050258684405026, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.0, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8529411764705882, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.8431372549019608, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.049019607843137254, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.23076923076923078, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.05, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.5, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1087, 184, 16.927322907083717, 12527.737810487573, 0, 60389, 814.0, 42745.80000000002, 54722.799999999996, 60129.0, 1.077459099672401, 16.925227694700922, 0.5634317106397847], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 198, 183, 92.42424242424242, 64551.752525252545, 25534, 111121, 67961.0, 89789.8, 96897.5, 106388.79999999996, 0.27318069247166443, 18.646414675873867, 0.38531908160238415], "isController": true}, {"data": ["2.5 Select patient", 10, 0, 0.0, 796.8000000000001, 555, 1142, 728.5, 1136.4, 1142.0, 1142.0, 0.22136137244050913, 5.046044894853348, 0.15395856391809631], "isController": false}, {"data": ["Choose session", 198, 0, 0.0, 0.7777777777777785, 0, 41, 1.0, 1.0, 1.0, 1.3999999999996362, 0.29268898395532206, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 3, 0, 0.0, 886.6666666666666, 621, 1096, 943.0, 1096.0, 1096.0, 1096.0, 0.1229457809106184, 2.859129748780788, 0.09220933568296381], "isController": false}, {"data": ["2.3 Search by first/last name", 52, 36, 69.23076923076923, 39323.173076923085, 12211, 60377, 41082.0, 60127.0, 60129.4, 60377.0, 0.07563746381765553, 2.466547240687137, 0.0590931890827503], "isController": false}, {"data": ["2.5 Select td_ipv", 3, 0, 0.0, 853.0, 591, 985, 983.0, 985.0, 985.0, 985.0, 0.13584495562398116, 3.3094077584450283, 0.09472001788625249], "isController": false}, {"data": ["4.0 Vaccination for flu", 4, 0, 0.0, 3142.5, 3066, 3188, 3158.0, 3188.0, 3188.0, 3188.0, 0.14203032347406172, 6.409707828090047, 0.8432356948833576], "isController": true}, {"data": ["4.0 Vaccination for hpv", 3, 0, 0.0, 3153.0, 3134, 3167, 3158.0, 3167.0, 3167.0, 3167.0, 0.07762368039743324, 3.3367064595839366, 0.4632405379967915], "isController": true}, {"data": ["1.2 Sign-in page", 51, 0, 0.0, 1989.5882352941176, 132, 20990, 146.0, 11582.200000000046, 18179.8, 20990.0, 0.07578053955744166, 0.4476528161943013, 0.04566073526068506], "isController": false}, {"data": ["Get correct patient name", 16, 0, 0.0, 3.8749999999999996, 0, 51, 1.0, 16.000000000000036, 51.0, 51.0, 0.024562593932732267, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 11, 1, 9.090909090909092, 18567.363636363636, 11837, 34038, 16603.0, 32058.800000000007, 34038.0, 34038.0, 0.016487972024408194, 1.487205122925326, 0.024538739614451258], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 136.0, 136, 136, 136.0, 136.0, 136.0, 136.0, 7.352941176470588, 35.005457261029406, 5.37109375], "isController": false}, {"data": ["1.1 Homepage", 51, 0, 0.0, 1404.843137254902, 405, 22759, 449.0, 2603.400000000004, 8035.999999999997, 22759.0, 0.07813337827279274, 0.4296572783731405, 0.04234768060683591], "isController": false}, {"data": ["1.3 Sign-in", 51, 1, 1.9607843137254901, 8962.72549019608, 1175, 46813, 2548.0, 25728.00000000001, 43905.99999999999, 46813.0, 0.0751741165198806, 1.0935513551608507, 0.16532576602056234], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 3, 0, 0.0, 3285.0, 3115, 3430, 3310.0, 3430.0, 3430.0, 3430.0, 0.1223091976516634, 5.847191857265167, 0.7427337507134704], "isController": true}, {"data": ["2.1 Open session", 198, 63, 31.818181818181817, 28232.863636363636, 6795, 58865, 27101.5, 39896.2, 47746.54999999998, 57331.48999999998, 0.2885855663491739, 3.265676069533818, 0.18560814990052543], "isController": false}, {"data": ["4.3 Vaccination confirm", 13, 0, 0.0, 1568.3076923076924, 1358, 1891, 1508.0, 1861.8, 1891.0, 1891.0, 0.09487112123069738, 1.8951276153413903, 0.2209716034314155], "isController": false}, {"data": ["4.1 Vaccination questions", 13, 0, 0.0, 850.4615384615385, 697, 1061, 757.0, 1043.4, 1061.0, 1061.0, 0.10116337885685381, 1.1608482524999029, 0.20969058840122953], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 51, 1, 1.9607843137254901, 15362.80392156863, 2778, 66585, 6029.0, 45593.40000000001, 56783.39999999999, 66585.0, 0.07544334057194928, 3.649993426444222, 0.2964701970143668], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 3, 0, 0.0, 3340.0, 3197, 3609, 3214.0, 3609.0, 3609.0, 3609.0, 0.11313497001923294, 5.294584016857111, 0.6755321468303352], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 1294.0, 1294, 1294, 1294.0, 1294.0, 1294.0, 1294.0, 0.7727975270479134, 20.06330298493045, 0.5033749517001546], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 1165.0, 1165, 1165, 1165.0, 1165.0, 1165.0, 1165.0, 0.8583690987124463, 15.276287553648068, 0.559113465665236], "isController": false}, {"data": ["2.5 Select hpv", 3, 0, 0.0, 709.0, 557, 999, 571.0, 999.0, 999.0, 999.0, 0.08322467889144727, 1.8461953751352402, 0.062093412766665745], "isController": false}, {"data": ["2.5 Select flu", 4, 0, 0.0, 569.25, 553, 611, 556.5, 611.0, 611.0, 611.0, 0.15666000861630047, 3.589067028453374, 0.11688305330356792], "isController": false}, {"data": ["Debug Sampler", 209, 0, 0.0, 0.4784688995215308, 0, 4, 0.0, 1.0, 2.0, 3.9000000000000057, 0.2551917479047414, 1.5251431981325825, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 50, 0, 0.0, 3065.760000000001, 755, 18565, 2421.5, 3808.5999999999995, 10457.9, 18565.0, 0.07376676718618141, 1.6874868372424803, 0.04408716945111624], "isController": false}, {"data": ["4.2 Vaccination batch", 13, 0, 0.0, 804.6153846153846, 681, 996, 722.0, 988.0, 996.0, 996.0, 0.10259567046270647, 1.4555144186376874, 0.16223248672175264], "isController": false}, {"data": ["2.2 Session register", 135, 83, 61.48148148148148, 36546.355555555565, 3957, 60389, 41084.0, 60127.0, 60129.4, 60383.96, 0.19977152057202724, 10.780634558049904, 0.13018964328945265], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 125.0, 125, 125, 125.0, 125.0, 125.0, 125.0, 8.0, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 147, 79.8913043478261, 13.523459061637535], "isController": false}, {"data": ["504/Gateway Time-out", 37, 20.108695652173914, 3.4038638454461823], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1087, 184, "502/Bad Gateway", 147, "504/Gateway Time-out", 37, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 52, 36, "502/Bad Gateway", 29, "504/Gateway Time-out", 7, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 11, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 51, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 198, 63, "502/Bad Gateway", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 135, 83, "502/Bad Gateway", 53, "504/Gateway Time-out", 30, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
