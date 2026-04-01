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

    var data = {"OkPercent": 99.96685082872928, "KoPercent": 0.03314917127071823};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7391751680964526, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4381918819188192, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9805675508945095, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7448979591836735, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9822194972409565, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.46551724137931033, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4650602409638554, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7660677263303386, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.48951048951048953, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.4748201438848921, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.8985964912280702, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7700931355639876, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7679003804911795, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.46983105390185037, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.4650259067357513, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9638701775872627, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7162420382165605, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9696495619524406, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.31258644536652835, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4637305699481865, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.3007246376811594, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4632352941176471, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.34172661870503596, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7258557457212714, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9758317639673572, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9742647058823529, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9659090909090909, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.4444444444444444, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 27150, 9, 0.03314917127071823, 1092.9953959484321, 0, 60001, 190.0, 1007.0, 1666.9500000000007, 27664.99, 7.263343417297405, 360.1785376712705, 56.812216054102414], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1626, 8, 0.4920049200492005, 1102.271217712178, 366, 3910, 974.0, 1700.8999999999999, 2025.0, 2976.530000000001, 0.4556688313271481, 73.0814041284584, 16.85698760779048], "isController": true}, {"data": ["2.5 Select patient", 1621, 0, 0.0, 140.7544725478101, 55, 2450, 100.0, 251.79999999999995, 360.59999999999945, 1029.1599999999967, 0.456785447790635, 11.496948300802517, 3.312141401584575], "isController": false}, {"data": ["7.1 Full name search", 147, 0, 0.0, 819.0204081632655, 164, 8703, 469.0, 1026.0000000000002, 4364.599999999989, 7395.960000000028, 0.04216418734552346, 1.6740973390561418, 0.31283620875044565], "isController": false}, {"data": ["2.3 Search by first/last name", 1631, 0, 0.0, 135.4040465971797, 62, 2151, 98.0, 204.79999999999995, 320.5999999999988, 970.1200000000006, 0.4565793333885745, 14.656295454978087, 3.4322207249120713], "isController": false}, {"data": ["4.0 Vaccination for flu", 406, 0, 0.0, 932.5738916256151, 213, 4696, 793.5, 1437.6, 1934.5999999999995, 3015.5600000000013, 0.11614029747935506, 6.213550053285798, 3.321773304830807], "isController": true}, {"data": ["4.0 Vaccination for hpv", 415, 0, 0.0, 900.1927710843378, 195, 3426, 762.0, 1427.2, 1855.5999999999992, 2430.04, 0.11890105627114253, 5.896804658564873, 3.394793312449485], "isController": true}, {"data": ["1.2 Sign-in page", 2894, 0, 0.0, 1787.744644091224, 11, 37290, 173.5, 1600.0, 5879.25, 28133.750000000004, 0.8048945599251509, 49.98281560587715, 6.99530953231635], "isController": false}, {"data": ["7.7 Due vaccination search", 143, 0, 0.0, 711.0069930069933, 526, 3239, 649.0, 873.6, 1035.7999999999993, 2847.400000000002, 0.041486047632945375, 5.568965583751481, 0.31584551520594195], "isController": false}, {"data": ["7.2 First name search", 139, 0, 0.0, 1214.5899280575534, 292, 6515, 725.0, 2810.0, 4945.0, 6140.599999999995, 0.04060021725497549, 5.526251038920128, 0.30091157254426376], "isController": false}, {"data": ["2.4 Patient attending session", 1425, 8, 0.5614035087719298, 426.9150877192987, 107, 2974, 359.0, 653.6000000000004, 885.5000000000002, 1604.8400000000001, 0.4003471360851557, 13.386868279874816, 3.5296175055367307], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 9.191176470588236, 17.348345588235293], "isController": false}, {"data": ["1.1 Homepage", 2899, 0, 0.0, 1793.7347361159052, 30, 32677, 161.0, 1595.0, 6351.0, 28078.0, 0.7999721844787183, 60.046400583501615, 6.9404416168454715], "isController": false}, {"data": ["1.3 Sign-in", 2891, 0, 0.0, 1791.7388446904163, 53, 33549, 204.0, 1581.2000000000007, 5933.200000000004, 28105.04, 0.8048241566397715, 50.249585791164975, 7.232481376957809], "isController": false}, {"data": ["Run some searches", 1243, 1, 0.08045052292839903, 4122.181013676592, 0, 60001, 846.0, 26894.600000000002, 27567.8, 28860.639999999996, 0.34813577911555027, 40.90055435738981, 2.6122308253821793], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 386, 0, 0.0, 913.5777202072536, 160, 4365, 771.5, 1432.0000000000005, 1924.299999999999, 2690.469999999999, 0.11147341575627637, 5.620033343564966, 3.1820913192532205], "isController": true}, {"data": ["2.1 Open session", 1633, 0, 0.0, 286.7336191059392, 114, 2185, 238.0, 429.60000000000014, 603.5999999999999, 1201.8800000000015, 0.4559390599614308, 10.821472524454025, 3.30846228121626], "isController": false}, {"data": ["4.3 Vaccination confirm", 1570, 0, 0.0, 581.874522292993, 316, 3351, 511.0, 859.0, 1118.2999999999975, 1935.2899999999963, 0.45562542134468703, 9.77078496469846, 4.721252353036859], "isController": false}, {"data": ["4.1 Vaccination questions", 1598, 0, 0.0, 178.18898623279082, 68, 2288, 116.0, 286.10000000000014, 544.05, 1132.199999999999, 0.4560273228285337, 6.558852644227202, 4.297312981889323], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 46.0, 46, 46, 46.0, 46.0, 46.0, 46.0, 21.73913043478261, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 2892, 0, 0.0, 5646.277316735823, 287, 93324, 1086.5, 4685.700000000001, 17290.04999999998, 84409.15000000001, 0.8046113243201285, 198.19983507397998, 24.50105206817036], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 0, 0.0, 915.9274611398963, 226, 4413, 783.5, 1474.9, 1801.5499999999988, 2635.859999999996, 0.11104389024145717, 5.977742330096375, 3.1641243845838285], "isController": true}, {"data": ["7.0 Open Children Search", 1252, 0, 0.0, 3898.5710862619803, 76, 31193, 795.0, 26848.9, 27549.4, 28444.57, 0.34662726411696293, 39.66780561417465, 2.513560827028565], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.6542514534883725, 14.353197674418606], "isController": false}, {"data": ["7.8 Year group search", 138, 0, 0.0, 1551.326086956522, 1295, 3598, 1476.0, 1801.4, 2192.3499999999976, 3316.0299999999893, 0.04083380257684966, 5.663027611380854, 0.31242025803782336], "isController": false}, {"data": ["7.9 DOB search", 136, 0, 0.0, 1052.3602941176468, 665, 3780, 941.0, 1390.6999999999998, 1888.1000000000001, 3699.3399999999992, 0.03933752142954867, 5.425804976120534, 0.2979501449884142], "isController": false}, {"data": ["7.4 Partial name search", 139, 0, 0.0, 1847.417266187051, 248, 8731, 1000.0, 4617.0, 6243.0, 8236.199999999993, 0.03952094923064938, 5.359959879839256, 0.29286418341473514], "isController": false}, {"data": ["Debug Sampler", 1631, 0, 0.0, 0.3617412630288171, 0, 20, 0.0, 1.0, 1.0, 1.0, 0.45660195759340816, 2.6163939778163114, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1636, 0, 0.0, 526.872860635696, 321, 2071, 521.5, 729.0, 866.1499999999999, 1368.5599999999986, 0.4560923313761694, 37.71239821166016, 3.3067026171015668], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 142.578125, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1593, 0, 0.0, 163.63214061519162, 68, 1915, 111.0, 236.0, 391.0999999999997, 1335.8999999999992, 0.4554900707167635, 7.421704054958894, 4.059814604747276], "isController": false}, {"data": ["7.5 Needs Consent search", 140, 1, 0.7142857142857143, 28053.85, 26410, 60001, 27384.5, 28697.2, 29283.9, 57344.20000000002, 0.04099844088786224, 5.634042295364336, 0.31081485426225647], "isController": false}, {"data": ["2.2 Session register", 1632, 0, 0.0, 164.84374999999977, 60, 2044, 101.0, 330.0, 495.6999999999998, 959.7900000000027, 0.4566342918922791, 20.260647352643804, 3.3175171188894383], "isController": false}, {"data": ["7.6 Needs triage search", 132, 0, 0.0, 238.58333333333331, 128, 1696, 189.0, 376.40000000000015, 615.5, 1613.829999999997, 0.03709048730156589, 2.4890620710534317, 0.2826854475192084], "isController": false}, {"data": ["7.3 Last name search", 126, 0, 0.0, 1269.412698412699, 330, 5685, 871.5, 3167.7, 4031.5999999999967, 5616.1500000000015, 0.037150651197843144, 5.0817569667974904, 0.2753531725919007], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 11.11111111111111, 0.003683241252302026], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, 88.88888888888889, 0.029465930018416207], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 27150, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1425, 8, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 140, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
