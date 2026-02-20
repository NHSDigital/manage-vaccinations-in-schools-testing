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

    var data = {"OkPercent": 99.26794931956827, "KoPercent": 0.7320506804317222};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8271834350942394, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.4143794749403341, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9846938775510204, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9259259259259259, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9675208581644815, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.46921182266009853, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4575242718446602, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3148148148148148, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9701102727800348, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.8732240437158469, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9773913043478261, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9688953488372093, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.45354523227383864, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9116775340841731, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.48148148148148145, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.7217766810610734, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9683120048750762, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4074074074074074, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.44302325581395346, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4559902200488998, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6071428571428571, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 year group"], "isController": false}, {"data": [1.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6977501480165779, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9654645476772616, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9658348187759952, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9814814814814815, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21310, 156, 0.7320506804317222, 272.93899577662785, 0, 46243, 132.0, 581.0, 742.0, 1441.9800000000032, 5.680338485266172, 1215.313181553987, 43.01270516132788], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 27, 0, 0.0, 104.4074074074074, 89, 158, 98.0, 133.6, 152.39999999999998, 158.0, 0.007886886852968565, 1.9402543240770005, 0.058700369025975314], "isController": false}, {"data": ["2.0 Register attendance", 1676, 29, 1.730310262529833, 1243.556085918856, 439, 46748, 1027.0, 1748.1999999999998, 2181.3499999999985, 3937.1400000000003, 0.46923855685065896, 500.12401100047344, 15.860594817265738], "isController": true}, {"data": ["2.5 Select patient", 1666, 7, 0.42016806722689076, 137.83613445378143, 57, 7204, 95.0, 195.29999999999995, 307.64999999999986, 943.289999999999, 0.46913164464714036, 103.98193632854364, 3.376433160567486], "isController": false}, {"data": ["7.1 Full name search", 27, 1, 3.7037037037037037, 315.88888888888897, 197, 626, 286.0, 457.79999999999984, 622.4, 626.0, 0.0078867716639394, 1.7915457354071356, 0.056588613612158944], "isController": false}, {"data": ["2.3 Search by first/last name", 1678, 6, 0.3575685339690107, 258.3057210965427, 62, 46243, 135.0, 350.0, 518.0999999999999, 1358.2000000000007, 0.46943444619324476, 108.90641493719495, 3.5053710929303956], "isController": false}, {"data": ["4.0 Vaccination for flu", 406, 7, 1.7241379310344827, 931.8177339901478, 75, 6570, 781.0, 1235.9, 1568.999999999999, 4157.690000000002, 0.11602910673020261, 76.34517628636556, 3.2847500632837323], "isController": true}, {"data": ["4.0 Vaccination for hpv", 412, 11, 2.6699029126213594, 936.3689320388347, 215, 6755, 780.5, 1319.4999999999995, 1616.699999999998, 5493.550000000005, 0.11856804337978784, 73.15287306808914, 3.3516429520687248], "isController": true}, {"data": ["7.6 First name search", 27, 1, 3.7037037037037037, 1858.9629629629633, 308, 5811, 1193.0, 5256.0, 5664.199999999999, 5811.0, 0.007883506303301261, 2.8580119768892094, 0.056507301130524004], "isController": false}, {"data": ["1.2 Sign-in page", 1723, 10, 0.5803830528148578, 175.29599535693538, 15, 7555, 101.0, 291.60000000000014, 417.39999999999986, 1548.799999999999, 0.4790603632740036, 108.94372587755213, 4.051619342802445], "isController": false}, {"data": ["2.4 Patient attending session", 915, 12, 1.3114754098360655, 481.65464480874317, 66, 5946, 385.0, 703.8, 889.9999999999997, 1964.2000000000144, 0.25755342263165554, 67.55809594422674, 2.2449278930462264], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 10.44921875, 19.661458333333336], "isController": false}, {"data": ["1.1 Homepage", 1725, 11, 0.6376811594202898, 152.92985507246354, 26, 6148, 104.0, 255.4000000000001, 367.09999999999945, 823.22, 0.4793177849127433, 105.54568289238414, 4.045263283094115], "isController": false}, {"data": ["1.3 Sign-in", 1720, 14, 0.813953488372093, 184.6633720930235, 45, 9076, 105.0, 323.9000000000001, 436.0, 1283.4299999999994, 0.4789178683699808, 107.26572093149525, 4.207313377784058], "isController": false}, {"data": ["Run some searches", 27, 1, 3.7037037037037037, 7139.111111111111, 3795, 14002, 6280.0, 12610.4, 13605.999999999998, 14002.0, 0.007823288713544199, 18.922063456143512, 0.4608414496633668], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 409, 7, 1.7114914425427872, 1051.9755501222494, 220, 8845, 829.0, 1364.0, 1944.0, 7853.699999999977, 0.11780126954629806, 75.89602382507275, 3.336598831538856], "isController": true}, {"data": ["2.1 Open session", 1687, 9, 0.5334914048606995, 373.29697688203913, 103, 5583, 318.0, 587.0, 744.0, 1243.199999999999, 0.47081123818332166, 106.33415966734967, 3.388568257652357], "isController": false}, {"data": ["7.7 Partial name search", 27, 0, 0.0, 1231.6296296296296, 279, 5852, 741.0, 3261.199999999998, 5833.599999999999, 5852.0, 0.007886750930271481, 2.7791936985663344, 0.05821470786671274], "isController": false}, {"data": ["4.3 Vaccination confirm", 1621, 34, 2.097470697100555, 598.631091918569, 15, 7618, 500.0, 840.3999999999999, 1074.8999999999999, 2434.2799999999966, 0.469128399372103, 102.4006432477309, 4.797196137526393], "isController": false}, {"data": ["4.1 Vaccination questions", 1641, 18, 1.0968921389396709, 192.48019500304684, 23, 7388, 117.0, 262.79999999999995, 376.7999999999997, 1404.2999999999902, 0.4681939127373281, 99.81906791037153, 4.374333577962989], "isController": false}, {"data": ["7.7 Last name search", 27, 0, 0.0, 1343.3703703703702, 440, 4528, 1113.0, 3356.2, 4141.199999999998, 4528.0, 0.007882079420999962, 2.8954673928956773, 0.05819077412821282], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1720, 29, 1.686046511627907, 1119.5773255813942, 259, 21282, 962.0, 1506.0, 1867.5499999999984, 4518.689999999996, 0.4787826894448459, 457.2751269422189, 15.682308870019964], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 409, 9, 2.2004889975550124, 933.3129584352087, 92, 8048, 780.0, 1271.0, 1689.0, 4449.899999999984, 0.11841103393967117, 76.17420298282171, 3.3571061638878192], "isController": true}, {"data": ["7.0 Open Children Search", 28, 0, 0.0, 1079.7857142857142, 246, 7638, 601.0, 2554.5000000000045, 6660.599999999994, 7638.0, 0.007851919527920165, 2.4795744056307236, 0.056701309230464216], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.5 year group", 27, 0, 0.0, 2046.259259259259, 1733, 3395, 1911.0, 2707.6, 3215.399999999999, 3395.0, 0.00788133626596883, 2.8497940453585495, 0.058851472660520196], "isController": false}, {"data": ["7.2 No Consent search", 27, 0, 0.0, 113.99999999999999, 82, 291, 104.0, 150.79999999999998, 242.59999999999974, 291.0, 0.007886737107886765, 1.9481900842026028, 0.05883788855689945], "isController": false}, {"data": ["Debug Sampler", 1678, 0, 0.0, 0.28188319427890335, 0, 6, 0.0, 1.0, 1.0, 1.0, 0.46945296419819643, 2.6494359334140563, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1689, 5, 0.2960331557134399, 617.6666666666669, 302, 7575, 574.0, 852.0, 983.5, 1545.7999999999902, 0.47091756433294346, 135.98112274953195, 3.39224417121018], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1636, 24, 1.466992665036675, 177.7053789731053, 20, 8348, 111.0, 248.0, 389.04999999999905, 1323.669999999999, 0.46786783248501307, 98.83691036874191, 4.135123920093265], "isController": false}, {"data": ["2.2 Session register", 1683, 4, 0.23767082590612001, 211.2733214497919, 59, 4756, 159.0, 331.2000000000003, 530.8, 1481.0000000000061, 0.4703131257043868, 112.3883675476468, 3.397211863872155], "isController": false}, {"data": ["7.3 Due vaccination", 27, 0, 0.0, 124.59259259259258, 84, 516, 95.0, 223.9999999999999, 451.99999999999966, 516.0, 0.007886923714168537, 2.008329757593209, 0.05859281434064734], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 18, 11.538461538461538, 0.08446738620366025], "isController": false}, {"data": ["502/Bad Gateway", 2, 1.2820512820512822, 0.009385265133740028], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 9, 5.769230769230769, 0.04223369310183012], "isController": false}, {"data": ["500/Internal Server Error", 102, 65.38461538461539, 0.4786485218207414], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, 1.2820512820512822, 0.009385265133740028], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 23, 14.743589743589743, 0.10793054903801032], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21310, 156, "500/Internal Server Error", 102, "Test failed: text expected to contain /Vaccination outcome recorded for/", 23, "Test failed: text expected to contain /Check and confirm/", 18, "Test failed: text expected to contain /Which batch did you use?/", 9, "502/Bad Gateway", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select patient", 1666, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.1 Full name search", 27, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.3 Search by first/last name", 1678, 6, "500/Internal Server Error", 4, "502/Bad Gateway", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.6 First name search", 27, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.2 Sign-in page", 1723, 10, "500/Internal Server Error", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.4 Patient attending session", 915, 12, "500/Internal Server Error", 10, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 1725, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 1720, 14, "500/Internal Server Error", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 1687, 9, "500/Internal Server Error", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1621, 34, "Test failed: text expected to contain /Vaccination outcome recorded for/", 23, "500/Internal Server Error", 11, "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1641, 18, "Test failed: text expected to contain /Which batch did you use?/", 9, "500/Internal Server Error", 9, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1689, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1636, 24, "Test failed: text expected to contain /Check and confirm/", 18, "500/Internal Server Error", 6, "", "", "", "", "", ""], "isController": false}, {"data": ["2.2 Session register", 1683, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
