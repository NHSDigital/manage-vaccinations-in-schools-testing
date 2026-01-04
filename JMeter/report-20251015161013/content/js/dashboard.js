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

    var data = {"OkPercent": 99.93190793953426, "KoPercent": 0.0680920604657497};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5238972640982691, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.21774193548387097, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.45401174168297453, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [9.242144177449168E-4, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9029850746268657, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8724770642201835, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6274336283185841, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.46, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.43345323741007197, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.4980392156862745, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4982300884955752, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5373001776198935, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7659380692167578, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5516304347826086, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7343, 5, 0.0680920604657497, 728.4503608879194, 0, 5375, 668.0, 1375.0, 1545.7999999999993, 2053.5599999999995, 6.113226648106923, 2061.932683404084, 21.805356244734284], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 496, 0, 0.0, 1622.5020161290324, 1090, 3659, 1529.0, 2109.3, 2311.0499999999984, 2813.619999999996, 0.4625860237467043, 181.01767070887345, 2.3995538836941224], "isController": false}, {"data": ["4.1 Vaccination questions", 511, 0, 0.0, 1317.373776908024, 567, 5375, 1256.0, 1485.2, 1640.7999999999997, 2214.359999999999, 0.4573152996578637, 174.9868999386741, 2.2711474905606], "isController": false}, {"data": ["Get Next Patient from STS", 554, 0, 0.0, 0.7851985559566788, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.46749910761677566, 0.19678118109345846, 0.29846975263896497], "isController": false}, {"data": ["2.0 Register attendance", 541, 5, 0.9242144177449169, 2752.151571164508, 1474, 5552, 2783.0, 3581.6, 3892.0, 4669.900000000004, 0.46308700129339087, 834.1751313947842, 8.061332024071108], "isController": true}, {"data": ["1.0 Login", 561, 0, 0.0, 3431.72192513369, 1832, 5786, 3421.0, 3927.6, 4138.599999999999, 4546.16, 0.47092993972768327, 758.1918367290726, 7.7634267629442775], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 129, 0, 0.0, 3730.37984496124, 2048, 7889, 3643.0, 4255.0, 4743.0, 7102.69999999997, 0.11665319277075749, 133.56873759712056, 1.6839226071626867], "isController": true}, {"data": ["2.5 Select patient", 536, 0, 0.0, 449.643656716418, 332, 1548, 405.0, 565.2, 678.8999999999999, 1080.0299999999997, 0.46025729756836453, 181.4010080056111, 1.6359626877630808], "isController": false}, {"data": ["2.3 Search by first/last name", 545, 0, 0.0, 453.36880733944975, 322, 1640, 428.0, 603.8000000000002, 709.9999999999993, 1019.0599999999968, 0.4642169639358784, 182.84259158702577, 1.716416604380675], "isController": false}, {"data": ["4.0 Vaccination for flu", 126, 0, 0.0, 3806.111111111111, 2128, 7430, 3727.5, 4254.8, 4771.449999999999, 6881.360000000008, 0.11394630416066791, 131.67437403292595, 1.6594172381314976], "isController": true}, {"data": ["4.0 Vaccination for hpv", 127, 0, 0.0, 3720.590551181102, 1979, 5984, 3655.0, 4318.8, 4577.399999999999, 5851.28, 0.11501747903421544, 131.6161220529601, 1.6636373400396673], "isController": true}, {"data": ["1.2 Sign-in page", 565, 0, 0.0, 720.1522123893814, 204, 2053, 595.0, 1261.4, 1326.3999999999999, 1579.8000000000006, 0.47271473799053565, 183.79920638830043, 1.9893899399296702], "isController": false}, {"data": ["Debug Sampler", 541, 0, 0.0, 0.5471349353049905, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.4619900070109759, 2.739730736308316, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 300, 5, 1.6666666666666667, 1072.0733333333337, 599, 2420, 1023.5, 1361.1000000000004, 1536.8, 2110.980000000002, 0.2991936730511272, 118.02264674047193, 1.3068588747076628], "isController": false}, {"data": ["1.4 Open Sessions list", 556, 0, 0.0, 1060.4892086330951, 552, 2617, 959.0, 1546.6, 1655.6, 1960.4699999999984, 0.46833120787335514, 209.31935276584957, 1.6621766719466238], "isController": false}, {"data": ["4.2 Vaccination batch", 510, 0, 0.0, 853.0078431372548, 553, 2424, 840.0, 1026.0, 1158.1499999999999, 1416.34, 0.4567596396435125, 175.97178254675518, 2.0428064107111035], "isController": false}, {"data": ["1.1 Homepage", 565, 0, 0.0, 759.2619469026544, 516, 1848, 732.0, 930.8000000000001, 1035.4999999999995, 1363.0600000000018, 0.4723653716888441, 183.4620704780108, 1.9697128167460631], "isController": false}, {"data": ["1.3 Sign-in", 563, 0, 0.0, 902.6642984014208, 443, 2355, 843.0, 1294.0, 1384.8, 1728.8000000000002, 0.4723649711588883, 184.15423358023074, 2.1685574528054534], "isController": false}, {"data": ["2.2 Session register", 549, 0, 0.0, 514.0182149362485, 316, 2054, 474.0, 696.0, 778.0, 1098.0, 0.46593141727171267, 188.5235496532036, 1.6627209713163622], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 128, 0, 0.0, 3736.632812499999, 1832, 5668, 3692.0, 4304.4000000000015, 4604.0, 5497.479999999996, 0.11820953193642914, 135.8355487880406, 1.7108221547981524], "isController": true}, {"data": ["2.1 Open session", 552, 0, 0.0, 742.1974637681158, 388, 2435, 695.0, 1071.1, 1241.0500000000002, 1527.4100000000028, 0.4668285343867421, 180.7050543610517, 1.6618361779640018], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.0680920604657497], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7343, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 300, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
