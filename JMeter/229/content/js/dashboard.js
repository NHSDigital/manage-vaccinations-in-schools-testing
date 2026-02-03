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

    var data = {"OkPercent": 99.88235294117646, "KoPercent": 0.11764705882352941};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7732412060301508, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.20665083135391923, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9815256257449344, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9899882214369847, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.4357142857142857, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.38461538461538464, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9730504587155964, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5466257668711656, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9742857142857143, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9620253164556962, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4225, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7514654161781946, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.4648241206030151, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.978021978021978, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.46774193548387094, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4296482412060301, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.1, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.05555555555555555, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.9328271028037384, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9822521419828641, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9900351699882767, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8888888888888888, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10200, 12, 0.11764705882352941, 366.87568627451157, 4, 18977, 159.0, 752.0, 1013.0, 1983.8699999999972, 5.460265593742322, 2271.6544494548366, 26.306829106835718], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 9, 0, 0.0, 132.55555555555554, 95, 209, 125.0, 209.0, 209.0, 209.0, 0.006049362800451686, 2.5410546675455046, 0.026452177896636554], "isController": false}, {"data": ["2.0 Register attendance", 842, 12, 1.4251781472684086, 1705.0213776722092, 628, 4728, 1571.0, 2434.4000000000005, 2746.85, 3649.4199999999996, 0.478438993346175, 990.1861064913858, 10.392003592909216], "isController": true}, {"data": ["2.5 Select patient", 839, 0, 0.0, 149.27175208581667, 73, 1653, 96.0, 265.0, 416.0, 795.4000000000008, 0.48024691216690385, 197.88079042939168, 1.995615931332705], "isController": false}, {"data": ["7.1 Full name search", 10, 0, 0.0, 9086.2, 7280, 15081, 8140.0, 14565.800000000003, 15081.0, 15081.0, 0.005871114936468666, 2.9771271407185895, 0.02537651827032257], "isController": false}, {"data": ["2.3 Search by first/last name", 849, 0, 0.0, 129.4935217903417, 71, 1208, 92.0, 217.0, 323.5, 630.0, 0.47961874546650124, 200.3462658269949, 2.071644965542585], "isController": false}, {"data": ["4.0 Vaccination for flu", 210, 0, 0.0, 1136.2952380952388, 205, 2766, 1028.5, 1742.9, 1917.9499999999998, 2394.9799999999987, 0.12355783006562097, 147.95264928396767, 2.0646080170130308], "isController": true}, {"data": ["4.0 Vaccination for hpv", 208, 0, 0.0, 1234.1442307692316, 190, 3510, 1062.5, 1942.8, 2154.85, 3005.6499999999987, 0.12253826227783313, 146.96056161443275, 2.057237533020527], "isController": true}, {"data": ["7.6 First name search", 9, 0, 0.0, 7118.666666666667, 6160, 8201, 6958.0, 8201.0, 8201.0, 8201.0, 0.0060275257006998624, 3.0357427826658405, 0.02601463349295114], "isController": false}, {"data": ["1.2 Sign-in page", 872, 0, 0.0, 219.204128440367, 13, 8193, 112.0, 284.5000000000002, 458.849999999999, 5714.529999999997, 0.48564966502982676, 197.9305259305315, 2.3844313612239376], "isController": false}, {"data": ["2.4 Patient attending session", 815, 12, 1.4723926380368098, 712.5619631901837, 131, 3476, 600.0, 1065.5999999999995, 1309.1999999999996, 1824.8400000000001, 0.4622285541547541, 193.49325767076084, 2.352159351734378], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.775862068965516, 20.339439655172413], "isController": false}, {"data": ["1.1 Homepage", 875, 0, 0.0, 223.77142857142871, 29, 8433, 118.0, 273.79999999999995, 424.9999999999993, 5789.52, 0.4861062500486106, 198.11847074671613, 2.3732944094170167], "isController": false}, {"data": ["1.3 Sign-in", 869, 0, 0.0, 255.5443037974687, 82, 8331, 122.0, 385.0, 547.5, 5755.199999999997, 0.4849281647840591, 198.12155926482043, 2.536554198255821], "isController": false}, {"data": ["Run some searches", 9, 0, 0.0, 36056.11111111111, 31339, 57284, 33036.0, 57284.0, 57284.0, 57284.0, 0.005833912403157054, 23.190342401636997, 0.2029525450929018], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 200, 0, 0.0, 1221.6700000000003, 201, 2971, 1121.5, 1791.4, 2054.35, 2763.8100000000013, 0.11853818707696684, 142.88727236037684, 1.9900680511062576], "isController": true}, {"data": ["2.1 Open session", 853, 0, 0.0, 598.9413833528729, 285, 2429, 486.0, 989.8000000000001, 1220.1999999999985, 1865.5400000000018, 0.47987371389062816, 197.01008007294868, 1.9978230846119185], "isController": false}, {"data": ["7.7 Partial name search", 9, 0, 0.0, 6777.555555555556, 5783, 8830, 6485.0, 8830.0, 8830.0, 8830.0, 0.006031625824741059, 2.9158984022893373, 0.026026439254826138], "isController": false}, {"data": ["4.3 Vaccination confirm", 796, 0, 0.0, 877.3944723618091, 534, 2777, 749.0, 1366.5000000000005, 1638.35, 2219.959999999999, 0.47617936647804937, 194.8766242199273, 2.8704986543147175], "isController": false}, {"data": ["4.1 Vaccination questions", 819, 0, 0.0, 178.61294261294285, 90, 1740, 122.0, 324.0, 477.0, 1003.7999999999993, 0.47715288292975366, 190.90528089244484, 2.7228880240816555], "isController": false}, {"data": ["7.7 Last name search", 9, 0, 0.0, 6803.111111111111, 6133, 8048, 6679.0, 8048.0, 8048.0, 8048.0, 0.0060249916654281956, 3.056977216494017, 0.026001735406800744], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 37.0, 37, 37, 37.0, 37.0, 37.0, 37.0, 27.027027027027028, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 868, 0, 0.0, 1061.844470046083, 324, 24957, 763.0, 1306.8000000000002, 1628.299999999998, 17470.979999999974, 0.4843266213921712, 814.9212990818369, 9.258536718779206], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 199, 0, 0.0, 1198.0804020100493, 209, 2637, 1094.0, 1898.0, 2029.0, 2633.0, 0.11736424672205788, 141.35038322246393, 1.9740606860883854], "isController": true}, {"data": ["7.0 Open Children Search", 10, 0, 0.0, 6022.799999999999, 480, 8328, 6173.0, 8274.7, 8328.0, 8328.0, 0.005888088632220563, 2.804067084061003, 0.02444764300548063], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.6542514534883725, 14.353197674418606], "isController": false}, {"data": ["7.5 year group", 9, 0, 0.0, 1619.3333333333333, 1496, 1989, 1598.0, 1989.0, 1989.0, 1989.0, 0.0060436066364172964, 3.0673789060585146, 0.026574556785392202], "isController": false}, {"data": ["7.2 No Consent search", 9, 0, 0.0, 3801.7777777777774, 1733, 18977, 1805.0, 18977.0, 18977.0, 18977.0, 0.005973933735799462, 3.241860541213505, 0.026227358168856553], "isController": false}, {"data": ["1.4 Open Sessions list", 856, 0, 0.0, 367.5140186915887, 217, 2168, 283.0, 560.9000000000002, 740.4999999999998, 1595.3799999999867, 0.4793514867175959, 223.06039329116513, 1.9905098047958667], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.2890625, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 817, 0, 0.0, 163.67074663402684, 86, 1948, 116.0, 276.20000000000005, 397.59999999999945, 703.8399999999992, 0.4780676936832453, 192.53153378869231, 2.484089355284462], "isController": false}, {"data": ["2.2 Session register", 853, 0, 0.0, 142.05978898007046, 70, 995, 93.0, 289.0, 377.1999999999998, 687.420000000001, 0.47967537280280004, 204.1000050838982, 2.0012061034473643], "isController": false}, {"data": ["7.3 Due vaccination", 9, 0, 0.0, 516.2222222222222, 355, 958, 437.0, 958.0, 958.0, 958.0, 0.006046469130759598, 3.0425457385997183, 0.026356858115234954], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, 100.0, 0.11764705882352941], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10200, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 815, 12, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
