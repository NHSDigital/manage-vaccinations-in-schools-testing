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

    var data = {"OkPercent": 99.33628318584071, "KoPercent": 0.6637168141592921};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7636374210056992, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.41122071516646114, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9303951367781155, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.2791392707710699, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4035608308605341, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.24083129584352078, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9700239808153477, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9752386634844868, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.2638190954773869, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.2811764705882353, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9549763033175356, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.42592592592592593, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.8291740938799762, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.928180158247109, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9680473372781065, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9492581602373887, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9284862932061978, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.2737226277372263, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.7963073257891602, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20792, 138, 0.6637168141592921, 348.5131781454391, 0, 6199, 183.0, 838.0, 1141.9500000000007, 1947.0, 5.539397204245557, 2171.9987402159886, 41.656442292539694], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1622, 34, 2.096177558569667, 1116.971023427867, 20, 6199, 939.5, 1785.2000000000003, 2213.3999999999996, 3564.429999999999, 0.46883572077277536, 196.23120464793024, 4.768978712325494], "isController": false}, {"data": ["4.1 Vaccination questions", 1645, 34, 2.066869300911854, 248.97629179331312, 26, 2457, 163.0, 471.4000000000001, 676.1999999999989, 1365.3999999999996, 0.4692774468111813, 192.23458147004155, 4.35553757817606], "isController": false}, {"data": ["2.0 Register attendance", 1673, 35, 2.092050209205021, 1550.454273759714, 478, 6563, 1398.0, 2473.000000000001, 2954.2, 3954.56, 0.46789271524882775, 894.3466227516748, 15.340054310898626], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1685, 1, 0.05934718100890208, 1194.5086053412465, 443, 3918, 1064.0, 1805.8000000000002, 2171.399999999998, 3089.099999999998, 0.46937135993457213, 811.9112425831142, 15.362232668114336], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 409, 17, 4.156479217603912, 1594.6601466992674, 74, 6116, 1470.0, 2409.0, 2924.0, 4691.599999999991, 0.11797783112901322, 145.62136971180237, 3.2989997795667874], "isController": true}, {"data": ["2.5 Select patient", 1668, 0, 0.0, 188.76258992805754, 71, 2232, 124.5, 363.2000000000003, 537.55, 1103.6499999999992, 0.4702519146272873, 198.13138357767474, 3.366041439364145], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 1676, 0, 0.0, 174.75536992840122, 75, 1966, 115.0, 317.0, 488.1999999999989, 1030.3600000000006, 0.46879637091191245, 199.25769708625296, 3.4804240256706573], "isController": false}, {"data": ["4.0 Vaccination for flu", 398, 0, 0.0, 1614.924623115577, 635, 4435, 1464.5, 2339.2000000000007, 2724.999999999998, 3724.0799999999954, 0.11355767346005952, 140.45582678501322, 3.2076838466278077], "isController": true}, {"data": ["4.0 Vaccination for hpv", 425, 0, 0.0, 1625.6823529411765, 268, 4900, 1443.0, 2551.4, 2967.2999999999997, 4408.360000000001, 0.12195576879481874, 150.1428992621138, 3.4366471503061806], "isController": true}, {"data": ["1.2 Sign-in page", 1688, 0, 0.0, 229.05627962085302, 17, 2625, 150.0, 450.10000000000014, 633.55, 1450.2699999999943, 0.46951203569626576, 195.97925407144538, 3.953757171497337], "isController": false}, {"data": ["Debug Sampler", 1675, 0, 0.0, 0.2955223880597018, 0, 6, 0.0, 1.0, 1.0, 1.0, 0.4688353262799974, 2.62397526898902, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 756, 35, 4.62962962962963, 913.3637566137569, 20, 5926, 738.5, 1564.900000000001, 1947.0, 3158.029999999999, 0.2122247044153406, 90.40320897666285, 1.834435601417021], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 1683, 1, 0.059417706476530004, 497.64646464646484, 273, 2570, 403.0, 766.8000000000004, 1027.5999999999992, 1634.0400000000016, 0.46911414358237635, 224.29127363026615, 3.3570621590873935], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 1643, 34, 2.069385270846013, 248.81679853925758, 21, 2671, 164.0, 497.60000000000014, 687.1999999999998, 1326.2399999999998, 0.469186337225324, 193.41265413336959, 4.115105619488024], "isController": false}, {"data": ["1.1 Homepage", 1690, 0, 0.0, 220.76627218934928, 34, 2764, 157.0, 388.9000000000001, 570.4499999999998, 1178.6299999999994, 0.4695122628824164, 195.7711114370166, 3.945384341974396], "isController": false}, {"data": ["1.3 Sign-in", 1685, 0, 0.0, 247.99940652818995, 87, 2460, 159.0, 497.0, 673.6999999999998, 1213.7999999999975, 0.4692887420833635, 196.0935500931789, 4.110305091643597], "isController": false}, {"data": ["2.2 Session register", 1678, 0, 0.0, 272.86948748510144, 76, 2993, 134.5, 607.1000000000001, 829.1999999999998, 1530.5000000000018, 0.46881107221115387, 210.62120902652694, 3.3596316102396107], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 411, 17, 4.13625304136253, 1566.0267639902688, 73, 6497, 1409.0, 2488.6000000000004, 2968.799999999999, 4246.759999999999, 0.11856452116809421, 146.80229313808553, 3.318366173956798], "isController": true}, {"data": ["2.1 Open session", 1679, 0, 0.0, 502.8576533650983, 122, 4172, 418.0, 905.0, 1123.0, 1915.0000000000005, 0.4688135666101987, 196.58911778724465, 3.355532524935912], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 34, 24.63768115942029, 0.16352443247402848], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 34, 24.63768115942029, 0.16352443247402848], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, 25.36231884057971, 0.16833397460561755], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 34, 24.63768115942029, 0.16352443247402848], "isController": false}, {"data": ["Assertion failed", 1, 0.7246376811594203, 0.004809542131589073], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20792, 138, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, "Test failed: text expected to contain /Check and confirm/", 34, "Test failed: text expected to contain /Which batch did you use?/", 34, "Test failed: text expected to contain /Vaccination outcome recorded for/", 34, "Assertion failed", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["4.3 Vaccination confirm", 1622, 34, "Test failed: text expected to contain /Vaccination outcome recorded for/", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1645, 34, "Test failed: text expected to contain /Which batch did you use?/", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 756, 35, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Open Sessions list", 1683, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 1643, 34, "Test failed: text expected to contain /Check and confirm/", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
