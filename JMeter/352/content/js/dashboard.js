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

    var data = {"OkPercent": 99.98638390577663, "KoPercent": 0.013616094223372026};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7342803231636016, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4756773399014778, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9950617283950617, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8631578947368421, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9972409564684243, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5048076923076923, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4987684729064039, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7530661082859706, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.49709302325581395, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.5086206896551724, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.9215262778977682, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7494777678304984, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7472280491459394, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5041518386714117, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5038265306122449, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9663814180929096, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.7430291508238276, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9937733499377335, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.3154030566376985, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5304014167650531, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.29891304347826086, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.4731182795698925, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.4, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.7106227106227107, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9953241895261845, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9914163090128756, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9946808510638298, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.5425531914893617, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29377, 4, 0.013616094223372026, 533.4040235558418, 0, 60006, 219.0, 1251.0, 2714.9500000000007, 4135.970000000005, 7.9527636645572635, 430.018608009688, 62.22735589278956], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 1624, 3, 0.18472906403940886, 1005.3054187192121, 407, 2926, 959.5, 1362.0, 1549.75, 1969.0, 0.4560168389272148, 69.25665057535973, 16.70203819774578], "isController": true}, {"data": ["2.5 Select patient", 1620, 0, 0.0, 121.96604938271592, 58, 1026, 94.0, 201.0, 270.89999999999964, 505.3199999999997, 0.4579008243345457, 11.59740192027565, 3.3024236512206167], "isController": false}, {"data": ["7.1 Full name search", 190, 0, 0.0, 512.8947368421055, 165, 3387, 304.0, 835.9, 2041.4499999999996, 3230.4800000000005, 0.054100936401786585, 2.1747603195044696, 0.3993225263628168], "isController": false}, {"data": ["2.3 Search by first/last name", 1631, 0, 0.0, 119.78724708767625, 66, 1059, 96.0, 190.0, 246.0, 422.3600000000001, 0.4569546480216469, 14.124126430574831, 3.417314294145853], "isController": false}, {"data": ["4.0 Vaccination for flu", 416, 0, 0.0, 818.3870192307692, 189, 2893, 770.5, 1083.9, 1189.2999999999995, 1538.2499999999973, 0.11879984738788836, 6.260962012285217, 3.3657916263349277], "isController": true}, {"data": ["4.0 Vaccination for hpv", 406, 0, 0.0, 817.7758620689658, 185, 2193, 771.5, 1081.0, 1209.6499999999996, 1590.1800000000003, 0.1163792633937913, 5.712724654438149, 3.3052702876144373], "isController": true}, {"data": ["1.2 Sign-in page", 3343, 0, 0.0, 725.4792102901591, 11, 9363, 222.0, 1849.3999999999992, 3657.0, 4795.039999999992, 0.9295409102271467, 64.41941126387812, 8.07452452135108], "isController": false}, {"data": ["7.7 Due vaccination search", 172, 0, 0.0, 708.8837209302327, 550, 3434, 660.0, 865.5000000000002, 945.8499999999999, 1844.0600000000222, 0.049596309111880045, 6.606329296424452, 0.375713836775519], "isController": false}, {"data": ["7.2 First name search", 174, 0, 0.0, 1224.3160919540235, 261, 8541, 706.5, 3177.5, 3573.25, 6968.25, 0.05251157744476853, 7.050615884035425, 0.3872363386906208], "isController": false}, {"data": ["2.4 Patient attending session", 1389, 3, 0.2159827213822894, 399.44132469402444, 128, 1764, 357.0, 556.0, 693.0, 1050.3999999999924, 0.39009095943840383, 12.523370198602356, 3.4229421947124], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 41.0, 41, 41, 41.0, 41.0, 41.0, 41.0, 24.390243902439025, 7.621951219512195, 14.386432926829269], "isController": false}, {"data": ["1.1 Homepage", 3351, 0, 0.0, 723.4225604297236, 27, 9562, 217.0, 1874.2000000000016, 3627.0, 4606.920000000001, 0.9299594297913933, 74.80801179579024, 8.064993032675822], "isController": false}, {"data": ["1.3 Sign-in", 3337, 0, 0.0, 736.2430326640667, 61, 9122, 249.0, 1849.000000000004, 3676.4999999999995, 4717.959999999999, 0.9284066849732773, 64.66799575651095, 8.321279300488547], "isController": false}, {"data": ["Run some searches", 1686, 1, 0.05931198102016608, 1377.825029655991, 0, 60006, 801.0, 3644.5, 3916.5999999999995, 5319.379999999997, 0.47224549371081603, 55.10671749651698, 3.5308982273497924], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 392, 0, 0.0, 821.8545918367337, 201, 2006, 790.5, 1089.0, 1222.7499999999998, 1502.2799999999993, 0.11309446359324768, 5.651309846030688, 3.2120466849509928], "isController": true}, {"data": ["2.1 Open session", 1636, 0, 0.0, 285.3031784841077, 118, 1307, 252.0, 439.5999999999999, 547.1499999999999, 761.2599999999998, 0.4570067288374598, 10.749720511996985, 3.299457345101676], "isController": false}, {"data": ["4.3 Vaccination confirm", 1578, 0, 0.0, 543.8086185044349, 340, 1998, 504.0, 747.1000000000001, 873.2499999999998, 1191.0, 0.4575129099531673, 9.818261839451239, 4.715867367862704], "isController": false}, {"data": ["4.1 Vaccination questions", 1606, 0, 0.0, 151.96388542963894, 78, 1401, 115.0, 252.29999999999995, 351.0, 529.5100000000004, 0.4588141454172295, 6.457982406398772, 4.302085393408132], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 48.0, 48, 48, 48.0, 48.0, 48.0, 48.0, 20.833333333333332, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 3337, 0, 0.0, 2449.708121066824, 258, 27658, 1074.0, 5285.800000000003, 11105.1, 13968.119999999964, 0.9285795182127641, 241.53359494720357, 27.728279903401432], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 390, 0, 0.0, 847.5153846153843, 190, 2299, 801.0, 1112.7, 1341.3499999999997, 1595.6299999999924, 0.11171977700732509, 5.973050208801399, 3.173115819105056], "isController": true}, {"data": ["7.0 Open Children Search", 1694, 0, 0.0, 1298.6062573789834, 84, 9082, 780.5, 3650.5, 3930.25, 5222.049999999998, 0.47259836197519334, 53.8780119470927, 3.4087231925449144], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.812686011904762, 14.694940476190474], "isController": false}, {"data": ["7.8 Year group search", 184, 0, 0.0, 1550.7717391304336, 1336, 3022, 1474.0, 1787.0, 1975.25, 2723.650000000002, 0.0529175699561647, 7.264100339477714, 0.4029136968537916], "isController": false}, {"data": ["7.9 DOB search", 186, 0, 0.0, 989.3064516129036, 707, 3165, 912.0, 1229.7000000000005, 1561.6, 2755.2299999999977, 0.055815058902892, 7.627454078516633, 0.4206346786425477], "isController": false}, {"data": ["7.4 Partial name search", 195, 0, 0.0, 1766.6871794871793, 273, 9151, 922.0, 4558.8, 5228.2, 8937.879999999997, 0.056809723260901425, 7.646654755804133, 0.4188012912595182], "isController": false}, {"data": ["Debug Sampler", 1631, 0, 0.0, 0.6400980993255673, 0, 27, 1.0, 1.0, 1.0, 1.0, 0.456973212291935, 2.617934419878671, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1638, 0, 0.0, 535.5225885225897, 322, 1744, 534.5, 745.0, 823.1499999999999, 1031.2199999999998, 0.4569954197229514, 37.72274930278904, 3.295483110838687], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.2890625, 153.564453125], "isController": false}, {"data": ["4.2 Vaccination batch", 1604, 0, 0.0, 139.2007481296757, 74, 776, 108.0, 234.5, 304.0, 498.60000000000036, 0.4596197935665264, 7.407524585736858, 4.07515487901168], "isController": false}, {"data": ["7.5 Needs Consent search", 207, 1, 0.4830917874396135, 4038.0628019323663, 3346, 60006, 3708.0, 4147.400000000001, 4388.6, 4650.359999999999, 0.058043496730917354, 7.887768861700433, 0.4386998284772611], "isController": false}, {"data": ["2.2 Session register", 1631, 0, 0.0, 136.2869405272837, 64, 952, 97.0, 255.79999999999995, 327.39999999999986, 567.7200000000003, 0.4569968999302877, 17.80047203589107, 3.3033944558514654], "isController": false}, {"data": ["7.6 Needs triage search", 188, 0, 0.0, 204.47872340425533, 135, 833, 179.0, 263.59999999999997, 388.2499999999998, 657.6699999999971, 0.05473632232473313, 3.596457462216652, 0.4151546697798435], "isController": false}, {"data": ["7.3 Last name search", 188, 0, 0.0, 1076.7340425531906, 307, 9330, 654.5, 2153.199999999999, 2963.8999999999965, 8807.56999999999, 0.05451029171704519, 7.371594443248408, 0.4020807917547385], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 25.0, 0.0034040235558430065], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 3, 75.0, 0.01021207066752902], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29377, 4, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 3, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1389, 3, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 207, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
